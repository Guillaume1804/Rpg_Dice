// dice-universal/features/roll3d/physics/Roll3DPhysicsWorld.ts

import * as CANNON from "cannon-es";

import type {
  Roll3DPhysicsAddDieOptions,
  Roll3DPhysicsDieSnapshot,
  Roll3DPhysicsLaunchMode,
  Roll3DPhysicsTransform,
  Roll3DPhysicsVector3,
} from "./Roll3DPhysicsTypes";

import type { Roll3DDieInstance, Roll3DDieSides } from "../types";

import {
  getRoll3DDieConvexGeometryData,
  ROLL3D_DIE_SCALE,
  type Roll3DPhysicalDieSides,
} from "../geometry/Roll3DDieGeometry";

/**
 * Le d6 visuel mesure 1.18 unité locale de côté.
 * Cette demi-extension utilise la même échelle que le mesh Three.js.
 */
const D6_HALF_EXTENT = (1.18 * ROLL3D_DIE_SCALE) / 2;

const PHYSICS_TIME_STEP = 1 / 60;
const PHYSICS_MAX_SUB_STEPS = 3;

/**
 * Détection Dice Universal d'un corps physiquement devenu calme.
 *
 * Le sleep natif de cannon-es est une optimisation du moteur et ne doit
 * pas être notre seule définition produit de "le lancer est terminé".
 *
 * Ces seuils servent uniquement à sortir des micro-oscillations
 * numériques persistantes, notamment sur les polyèdres comme le d20.
 */
const MOTION_SETTLE_MAX_LINEAR_SPEED = 0.14;
const MOTION_SETTLE_MAX_ANGULAR_SPEED = 0.22;

/**
 * Le corps doit rester sous les deux seuils pendant cette durée continue.
 *
 * On évite ainsi de stopper un dé simplement parce qu'il traverse
 * momentanément une phase de faible vitesse pendant un vrai roulement.
 */
const MOTION_SETTLE_REQUIRED_SECONDS = 0.22;

const TABLE_SURFACE_Y = -1.15;

const TABLE_WIDTH = 5.8;
const TABLE_DEPTH = 8.4;
const TABLE_WALL_HEIGHT = 4.8;
const TABLE_WALL_THICKNESS = 0.18;

const FLOOR_ID = "roll-3d-physics-floor";

const WALL_IDS = {
  left: "roll-3d-physics-wall-left",
  right: "roll-3d-physics-wall-right",
  top: "roll-3d-physics-wall-top",
  bottom: "roll-3d-physics-wall-bottom",
} as const;

function createCannonVec3(vector: Roll3DPhysicsVector3) {
  return new CANNON.Vec3(vector.x, vector.y, vector.z);
}

function createCannonQuaternion(
  transform: Roll3DPhysicsTransform["quaternion"],
) {
  return new CANNON.Quaternion(
    transform.x,
    transform.y,
    transform.z,
    transform.w,
  );
}

function toPhysicsTransform(body: CANNON.Body): Roll3DPhysicsTransform {
  return {
    position: {
      x: body.position.x,
      y: body.position.y,
      z: body.position.z,
    },
    quaternion: {
      x: body.quaternion.x,
      y: body.quaternion.y,
      z: body.quaternion.z,
      w: body.quaternion.w,
    },
  };
}

function createConvexDieShape(
  sides: Roll3DPhysicalDieSides,
): CANNON.ConvexPolyhedron {
  const geometry = getRoll3DDieConvexGeometryData(sides);

  return new CANNON.ConvexPolyhedron({
    vertices: geometry.vertices.map(
      (vertex) => new CANNON.Vec3(vertex.x, vertex.y, vertex.z),
    ),

    faces: geometry.faces.map((face) => [...face]),
  });
}

function createDieShape(sides: Roll3DDieSides): CANNON.Shape {
  /**
   * Le d6 est exactement cubique.
   *
   * CANNON.Box est plus simple, plus rapide
   * et numériquement plus stable qu'un ConvexPolyhedron
   * représentant la même forme.
   */
  if (sides === 6) {
    return new CANNON.Box(
      new CANNON.Vec3(D6_HALF_EXTENT, D6_HALF_EXTENT, D6_HALF_EXTENT),
    );
  }

  /**
   * D100 provisoire jusqu'à 4.0H.
   */
  if (sides === 100) {
    return new CANNON.Box(new CANNON.Vec3(0.42, 0.22, 0.23));
  }

  return createConvexDieShape(sides);
}

function createInitialVelocity(mode: Roll3DPhysicsLaunchMode) {
  if (mode === "resting") {
    return new CANNON.Vec3(0, 0, 0);
  }

  if (mode === "surface_roll") {
    const angle = Math.random() * Math.PI * 2;
    const strength = 9 + Math.random() * 5;

    return new CANNON.Vec3(
      Math.cos(angle) * strength,
      0.22 + Math.random() * 0.26,
      Math.sin(angle) * strength,
    );
  }

  if (mode === "gesture_throw") {
    /**
     * Valeur de secours uniquement.
     * Un vrai lancer gestuel fournit normalement sa vitesse personnalisée.
     */
    return new CANNON.Vec3(0, 1.8, -4.5);
  }

  return new CANNON.Vec3(
    (Math.random() - 0.5) * 0.42,
    -5.4 - Math.random() * 1.4,
    (Math.random() - 0.5) * 0.42,
  );
}

function createInitialAngularVelocity(mode: Roll3DPhysicsLaunchMode) {
  if (mode === "resting") {
    return new CANNON.Vec3(0, 0, 0);
  }

  if (mode === "surface_roll") {
    return new CANNON.Vec3(
      (Math.random() - 0.5) * 26,
      (Math.random() - 0.5) * 31,
      (Math.random() - 0.5) * 26,
    );
  }

  if (mode === "gesture_throw") {
    return new CANNON.Vec3(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 28,
      (Math.random() - 0.5) * 22,
    );
  }

  return new CANNON.Vec3(
    (Math.random() - 0.5) * 5.5,
    (Math.random() - 0.5) * 6.5,
    (Math.random() - 0.5) * 5.5,
  );
}

/**
 * Monde physique Roll3D.
 *
 * Rôle :
 * - isoler cannon-es
 * - gérer gravité, sol, murs et corps de dés
 * - fournir des snapshots exploitables par Three.js
 *
 * Important :
 * le moteur physique sert au rendu.
 * Le résultat officiel reste calculé par le moteur Dice Universal.
 */
export class Roll3DPhysicsWorld {
  private readonly world: CANNON.World;

  private readonly diceSnapshots = new Map<string, Roll3DPhysicsDieSnapshot>();
  private readonly staticBodies = new Map<string, CANNON.Body>();
  private readonly diceBodies = new Map<string, CANNON.Body>();

  /**
   * Temps continu pendant lequel chaque dé est resté sous les seuils
   * de mouvement définis par Dice Universal.
   *
   * Cette donnée appartient uniquement à la simulation en cours.
   */
  private readonly calmDurationByDieId = new Map<string, number>();

  /**
   * Le sol et les parois n'ont volontairement pas le même comportement.
   *
   * Sol :
   * - davantage d'accroche ;
   * - peu de rebond.
   *
   * Parois :
   * - moins d'accroche ;
   * - davantage de restitution pour renvoyer le dé dans la table.
   */
  private readonly floorMaterial = new CANNON.Material("roll3d-floor");

  private readonly wallMaterial = new CANNON.Material("roll3d-wall");

  private readonly diceMaterial = new CANNON.Material("roll3d-dice");

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    /**
     * Les dés polyédriques peuvent produire plusieurs points de contact
     * simultanés lorsqu'une face retombe sur la table.
     *
     * Sans réduction, cannon-es peut créer plusieurs contraintes de friction
     * pour le même couple dé/sol, ce qui peut freiner excessivement la
     * translation et surtout le roulement lors d'une retombée.
     *
     * Le mode friction reduction regroupe ces contacts afin d'obtenir
     * une réponse tangentielle plus cohérente.
     */
    this.world.narrowphase.enableFrictionReduction = true;

    this.world.allowSleep = true;

    this.world.defaultContactMaterial.friction = 0.68;
    this.world.defaultContactMaterial.restitution = 0.12;

    /**
     * Contact avec le tapis :
     * on conserve volontairement les valeurs qui ont donné
     * les bons résultats de stabilisation pendant 4.0B–4.0D.
     */
    const diceFloorContact = new CANNON.ContactMaterial(
      this.diceMaterial,
      this.floorMaterial,
      {
        /**
         * Suffisamment de friction pour convertir une partie du déplacement
         * en roulement, sans absorber brutalement la vitesse tangentielle
         * lors d'une retombée après rebond.
         */
        friction: 0.42,

        /**
         * Le tapis reste peu rebondissant verticalement.
         */
        restitution: 0.16,
      },
    );

    /**
     * Contact avec les parois :
     *
     * friction nettement inférieure au sol afin d'éviter qu'un dé
     * soit immédiatement "absorbé" par le bord ;
     *
     * restitution supérieure afin que l'impact produise un vrai
     * changement de trajectoire vers l'intérieur de la piste.
     *
     * Ce n'est pas un mur élastique : le rebond reste modéré.
     */
    const diceWallContact = new CANNON.ContactMaterial(
      this.diceMaterial,
      this.wallMaterial,
      {
        /**
         * Les parois doivent principalement rediriger le lancer,
         * pas absorber brutalement son énergie.
         *
         * Une friction assez faible permet de conserver la composante
         * tangentielle du mouvement lors de l'impact.
         */
        friction: 0.22,

        /**
         * Restitution nettement supérieure au premier réglage.
         *
         * Le dé doit repartir après un choc franc contre une paroi,
         * tout en restant suffisamment amorti pour ne pas transformer
         * la table en flipper.
         */
        restitution: 0.48,
      },
    );

    const diceDiceContact = new CANNON.ContactMaterial(
      this.diceMaterial,
      this.diceMaterial,
      {
        friction: 0.62,
        restitution: 0.1,
      },
    );

    this.world.addContactMaterial(diceFloorContact);

    this.world.addContactMaterial(diceWallContact);

    this.world.addContactMaterial(diceDiceContact);

    this.createStaticTableBodies();
  }

  reset() {
    for (const body of this.diceBodies.values()) {
      this.world.removeBody(body);
    }

    this.diceBodies.clear();
    this.diceSnapshots.clear();
    this.calmDurationByDieId.clear();

    /**
     * On conserve sol + murs : ils appartiennent à la table physique.
     */
  }

  addDie(
    instance: Roll3DDieInstance,
    transform: Roll3DPhysicsTransform,
    options: Roll3DPhysicsAddDieOptions = {},
  ) {
    /**
     * Si un corps existe déjà pour ce dé, on le remplace proprement.
     */
    this.removeDie(instance.id);

    this.calmDurationByDieId.delete(instance.id);

    const launchMode = options.launchMode ?? "drop";

    /**
     * Les critères de sommeil dépendent du contexte physique.
     *
     * Une chute initiale / un corps remis au repos doit pouvoir être
     * considéré comme stable malgré les micro-oscillations numériques
     * des polyèdres complexes comme le d20.
     *
     * Pendant un vrai lancer, on demande davantage de calme avant
     * d'autoriser Cannon à figer le corps afin de conserver les derniers
     * roulements perceptibles.
     */
    const isActiveThrow =
      launchMode === "surface_roll" || launchMode === "gesture_throw";

    const sleepSpeedLimit = isActiveThrow ? 0.145 : 0.16;

    const sleepTimeLimit = isActiveThrow ? 0.36 : 0.3;

    const body = new CANNON.Body({
      mass: this.getDieMass(instance.sides),
      material: this.diceMaterial,
      position: createCannonVec3(transform.position),
      quaternion: createCannonQuaternion(transform.quaternion),
      shape: createDieShape(instance.sides),

      /**
       * Le moteur doit conserver l'énergie du lancer suffisamment longtemps
       * pour que celle-ci soit dissipée principalement par les collisions,
       * les rebonds et le roulement physique.
       *
       * Les anciennes valeurs 0.18 / 0.22 amortissaient artificiellement
       * translation et rotation pendant toute la simulation.
       */
      linearDamping: 0.045,
      angularDamping: 0.065,

      allowSleep: true,

      /**
       * Un dé ne doit pas être considéré comme presque arrêté alors
       * qu'il possède encore un roulis perceptible.
       */
      sleepSpeedLimit,
      sleepTimeLimit,
    });

    const initialVelocity = options.linearVelocity
      ? createCannonVec3(options.linearVelocity)
      : createInitialVelocity(launchMode);

    const initialAngularVelocity = options.angularVelocity
      ? createCannonVec3(options.angularVelocity)
      : createInitialAngularVelocity(launchMode);

    body.velocity.copy(initialVelocity);
    body.angularVelocity.copy(initialAngularVelocity);

    /**
     * Les corps "resting" participent aux collisions.
     * Ils peuvent donc être poussés par les dés lancés, même s’ils commencent
     * avec une vitesse nulle.
     */
    body.wakeUp();

    this.world.addBody(body);
    this.diceBodies.set(instance.id, body);

    this.diceSnapshots.set(instance.id, {
      id: instance.id,
      transform: toPhysicsTransform(body),
      sleeping: body.sleepState === CANNON.Body.SLEEPING,
    });
  }

  removeDie(id: string) {
    const body = this.diceBodies.get(id);

    if (body) {
      this.world.removeBody(body);
      this.diceBodies.delete(id);
    }

    this.diceSnapshots.delete(id);
    this.calmDurationByDieId.delete(id);
  }

  clearDice() {
    for (const body of this.diceBodies.values()) {
      this.world.removeBody(body);
    }

    this.diceBodies.clear();
    this.diceSnapshots.clear();
    this.calmDurationByDieId.clear();
  }

  step(deltaSeconds: number) {
    this.world.step(PHYSICS_TIME_STEP, deltaSeconds, PHYSICS_MAX_SUB_STEPS);

    /**
     * Après le step Cannon, Dice Universal regarde si certains corps
     * sont visuellement devenus immobiles même si Cannon refuse encore
     * de les considérer comme SLEEPING.
     */
    this.updateMotionSettling(deltaSeconds);

    this.updateSnapshotsFromBodies();
  }

  getDiceSnapshots() {
    return Array.from(this.diceSnapshots.values());
  }

  /**
   * Réveille légèrement un dé qui s'est endormi dans une position ambiguë.
   *
   * Important :
   * - aucune orientation finale n'est imposée ;
   * - aucune face cible n'est connue ici ;
   * - on redonne simplement assez d'énergie au corps pour qu'il quitte
   *   naturellement une arête ou un sommet instable.
   */
  nudgeDieOffUnstableRest(
    id: string,
    options?: {
      /**
       * Direction horizontale privilégiée.
       *
       * Utilisée notamment lorsqu'un dé est coincé contre une paroi :
       * DiceTable3D peut alors demander au corps de revenir légèrement
       * vers l'intérieur de la table.
       */
      preferredHorizontalDirection?: Roll3DPhysicsVector3;
    },
  ): boolean {
    const body = this.diceBodies.get(id);

    if (!body) {
      return false;
    }

    this.calmDurationByDieId.delete(id);

    const preferredDirection = options?.preferredHorizontalDirection;

    let horizontalX: number;
    let horizontalZ: number;

    if (preferredDirection) {
      const horizontalLength = Math.sqrt(
        preferredDirection.x * preferredDirection.x +
          preferredDirection.z * preferredDirection.z,
      );

      if (horizontalLength > 0.0001) {
        horizontalX = preferredDirection.x / horizontalLength;

        horizontalZ = preferredDirection.z / horizontalLength;
      } else {
        horizontalX = (Math.random() - 0.5) * 0.8;

        horizontalZ = (Math.random() - 0.5) * 0.8;
      }
    } else {
      horizontalX = (Math.random() - 0.5) * 0.8;

      horizontalZ = (Math.random() - 0.5) * 0.8;
    }

    /**
     * Petit soulèvement :
     * juste assez pour libérer un contact sol/arête/mur
     * que le solveur aurait considéré comme stable.
     */
    body.velocity.y = Math.max(
      body.velocity.y,
      preferredDirection ? 0.22 : 0.16,
    );

    if (preferredDirection) {
      /**
       * Lorsqu'un dé repose à la fois contre le sol et une paroi,
       * une simple vitesse peut être absorbée par la friction/contact
       * avant que le corps ait réellement quitté le mur.
       *
       * On effectue donc d'abord un très léger désencastrement
       * vers l'intérieur de la table.
       *
       * Ce déplacement :
       * - ne choisit aucune face ;
       * - ne dépend d'aucun résultat ;
       * - sert uniquement à casser le contact numérique avec la paroi.
       */
      const wallSeparationDistance = 0.045;

      body.position.x += horizontalX * wallSeparationDistance;

      body.position.z += horizontalZ * wallSeparationDistance;

      /**
       * cannon-es doit recalculer l'AABB après ce petit déplacement direct.
       */
      body.aabbNeedsUpdate = true;

      /**
       * On conserve ensuite une petite vitesse vers l'intérieur
       * afin que le dé ne revienne pas immédiatement contre le mur.
       */
      body.velocity.x += horizontalX * 0.82;

      body.velocity.z += horizontalZ * 0.82;
    }

    /**
     * Le couple provoque le dernier basculement nécessaire.
     *
     * La rotation reste liée à la direction horizontale :
     * le dé roule donc globalement dans le même sens que son déplacement.
     */
    body.angularVelocity.x += horizontalZ * 2.4;

    body.angularVelocity.z -= horizontalX * 2.4;

    body.angularVelocity.y += (Math.random() - 0.5) * 0.5;

    body.wakeUp();

    return true;
  }

  /**
   * Détection applicative du repos physique.
   *
   * cannon-es peut maintenir certains polyèdres dans un état de
   * micro-oscillation extrêmement faible pendant longtemps.
   *
   * Pour Dice Universal, ce mouvement n'a plus d'intérêt visuel ni
   * physique une fois qu'il reste sous des seuils très faibles pendant
   * une durée continue.
   *
   * Important :
   * cette fonction ne décide PAS qu'une orientation est valide.
   *
   * Elle dit uniquement :
   * "ce corps ne possède plus de mouvement significatif".
   *
   * La validation de la face de support dans DiceTable3D reste ensuite
   * responsable de détecter une éventuelle tranche et de réveiller
   * le corps si nécessaire.
   */
  private updateMotionSettling(deltaSeconds: number) {
    for (const [id, body] of this.diceBodies.entries()) {
      /**
       * Rien à faire pour un corps que Cannon considère déjà endormi.
       */
      if (body.sleepState === CANNON.Body.SLEEPING) {
        this.calmDurationByDieId.delete(id);
        continue;
      }

      const linearSpeed = body.velocity.length();

      const angularSpeed = body.angularVelocity.length();

      const hasLowLinearMotion = linearSpeed <= MOTION_SETTLE_MAX_LINEAR_SPEED;

      const hasLowAngularMotion =
        angularSpeed <= MOTION_SETTLE_MAX_ANGULAR_SPEED;

      /**
       * Le dé possède encore un mouvement significatif :
       * toute période de calme précédente est annulée.
       */
      if (!hasLowLinearMotion || !hasLowAngularMotion) {
        this.calmDurationByDieId.delete(id);
        continue;
      }

      const previousCalmDuration = this.calmDurationByDieId.get(id) ?? 0;

      const nextCalmDuration = previousCalmDuration + Math.max(deltaSeconds, 0);

      if (nextCalmDuration < MOTION_SETTLE_REQUIRED_SECONDS) {
        this.calmDurationByDieId.set(id, nextCalmDuration);

        continue;
      }

      /**
       * À ce stade le mouvement est resté négligeable suffisamment
       * longtemps pour être considéré terminé côté expérience utilisateur.
       *
       * On supprime les résidus numériques avant de dormir le corps afin
       * d'éviter qu'il reparte immédiatement avec une ancienne vélocité
       * lors d'un wakeUp ultérieur.
       */
      body.velocity.set(0, 0, 0);
      body.angularVelocity.set(0, 0, 0);

      body.sleep();

      this.calmDurationByDieId.delete(id);

      if (__DEV__) {
        console.warn(
          `[Roll3D] motion-settled | ` +
            `id=${id} | ` +
            `linear=${linearSpeed.toFixed(4)} | ` +
            `angular=${angularSpeed.toFixed(4)}`,
        );
      }
    }
  }

  private updateSnapshotsFromBodies() {
    for (const [id, body] of this.diceBodies.entries()) {
      this.diceSnapshots.set(id, {
        id,
        transform: toPhysicsTransform(body),
        sleeping: body.sleepState === CANNON.Body.SLEEPING,
      });
    }
  }

  private getDieMass(sides: Roll3DDieSides) {
    if (sides === 100) {
      return 1.25;
    }

    if (sides === 4) {
      return 0.75;
    }

    return 1;
  }

  private createStaticTableBodies() {
    this.addStaticBody({
      id: FLOOR_ID,
      position: new CANNON.Vec3(0, TABLE_SURFACE_Y - 0.03, 0),
      shape: new CANNON.Box(
        new CANNON.Vec3(TABLE_WIDTH / 2, 0.03, TABLE_DEPTH / 2),
      ),
      material: this.floorMaterial,
    });

    this.addStaticBody({
      id: WALL_IDS.left,
      position: new CANNON.Vec3(
        -TABLE_WIDTH / 2,
        TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
        0,
      ),
      shape: new CANNON.Box(
        new CANNON.Vec3(
          TABLE_WALL_THICKNESS / 2,
          TABLE_WALL_HEIGHT / 2,
          TABLE_DEPTH / 2,
        ),
      ),
      material: this.wallMaterial,
    });

    this.addStaticBody({
      id: WALL_IDS.right,
      position: new CANNON.Vec3(
        TABLE_WIDTH / 2,
        TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
        0,
      ),
      shape: new CANNON.Box(
        new CANNON.Vec3(
          TABLE_WALL_THICKNESS / 2,
          TABLE_WALL_HEIGHT / 2,
          TABLE_DEPTH / 2,
        ),
      ),
      material: this.wallMaterial,
    });

    this.addStaticBody({
      id: WALL_IDS.top,
      position: new CANNON.Vec3(
        0,
        TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
        -TABLE_DEPTH / 2,
      ),
      shape: new CANNON.Box(
        new CANNON.Vec3(
          TABLE_WIDTH / 2,
          TABLE_WALL_HEIGHT / 2,
          TABLE_WALL_THICKNESS / 2,
        ),
      ),
      material: this.wallMaterial,
    });

    this.addStaticBody({
      id: WALL_IDS.bottom,
      position: new CANNON.Vec3(
        0,
        TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
        TABLE_DEPTH / 2,
      ),
      shape: new CANNON.Box(
        new CANNON.Vec3(
          TABLE_WIDTH / 2,
          TABLE_WALL_HEIGHT / 2,
          TABLE_WALL_THICKNESS / 2,
        ),
      ),
      material: this.wallMaterial,
    });
  }

  private addStaticBody(params: {
    id: string;
    position: CANNON.Vec3;
    shape: CANNON.Shape;
    material: CANNON.Material;
  }) {
    const { id, position, shape, material } = params;

    if (this.staticBodies.has(id)) {
      return;
    }

    const body = new CANNON.Body({
      mass: 0,
      material,
      position,
      shape,
    });

    body.type = CANNON.Body.STATIC;

    this.world.addBody(body);
    this.staticBodies.set(id, body);
  }
}
