// dice-universal\features\roll3d\geometry\Roll3DDieGeometry.ts

import * as THREE from "three";

import type { Roll3DDieSides } from "../types";

/**
 * Échelle commune entre :
 * - le mesh Three.js visible ;
 * - le collider cannon-es.
 *
 * Cette valeur ne doit plus être dupliquée entre renderer et physique.
 */
export const ROLL3D_DIE_SCALE = 0.4;

export type Roll3DPhysicalDieSides = Exclude<Roll3DDieSides, 100>;

export type Roll3DDieFaceTopology = {
  /**
   * Identité fonctionnelle provisoire de la face.
   *
   * La convention de numérotation définitive pourra être ajustée
   * lorsque nous ajouterons les chiffres visibles.
   */
  value: number;

  /**
   * Normale locale de la face, dé non transformé.
   */
  localNormal: THREE.Vector3;

  /**
   * Centre local approximatif de la face.
   * Il servira ensuite à positionner les chiffres.
   */
  localCenter: THREE.Vector3;
};

export type Roll3DTopFaceResult = {
  /**
   * Valeur fonctionnelle provisoire de la face la plus orientée vers le haut.
   */
  value: number;

  /**
   * Alignement de la normale de cette face avec l'axe vertical mondial.
   *
   * 1   = face parfaitement horizontale vers le haut
   * 0   = face verticale
   * -1  = face tournée vers le bas
   */
  alignment: number;

  /**
   * Écart entre la meilleure face candidate et la seconde.
   *
   * Plus cet écart est grand, plus la face dominante est évidente.
   * Un faible écart indique souvent un dé proche d'une arête.
   */
  confidenceGap: number;
};

export type Roll3DSupportFaceResult = {
  /**
   * Identité fonctionnelle provisoire
   * de la face la plus orientée vers le sol.
   */
  value: number;

  /**
   * Alignement avec l'axe vertical descendant.
   *
   * 1 = face parfaitement orientée vers le sol.
   */
  alignment: number;

  /**
   * Écart avec la deuxième meilleure candidate.
   *
   * Plus il est élevé, plus la surface
   * de support est sans ambiguïté.
   */
  confidenceGap: number;
};

export type Roll3DDieConvexGeometryData = {
  vertices: {
    x: number;
    y: number;
    z: number;
  }[];

  /**
   * Chaque tableau contient les indices ordonnés des sommets constituant
   * une vraie face convexe du dé.
   *
   * Les triangles coplanaires issus de Three.js sont regroupés afin
   * qu'une face carrée, pentagonale ou triangulaire reste une seule
   * face physique côté cannon-es.
   */
  faces: number[][];
};

/**
 * Géométrie d'un véritable d10 de JDR :
 * trapézoèdre pentagonal.
 *
 * Structure :
 * - 2 sommets polaires ;
 * - 5 sommets légèrement au-dessus de l'équateur ;
 * - 5 sommets légèrement en dessous, décalés de 36° ;
 * - 10 faces quadrilatérales en forme de cerf-volant.
 *
 * Chaque face quadrilatérale est triangulée uniquement pour Three.js.
 * getRoll3DDieConvexGeometryData() regroupera ensuite les deux triangles
 * coplanaires pour reconstruire une seule face physique côté cannon-es.
 */
function createD10Geometry(radius = 0.79, height = 1.58): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];

  const ringCount = 5;

  const topIndex = 0;
  const bottomIndex = 1;

  const upperRingStart = 2;
  const lowerRingStart = upperRingStart + ringCount;

  const apexY = height / 2;

  /**
   * Pour un trapézoèdre pentagonal à faces planes, les deux anneaux
   * doivent rester très proches de l'équateur.
   *
   * Le ratio ci-dessous découle de la géométrie pentagonale du solide.
   */
  const ringY = apexY / 9.472135955;

  vertices.push(0, apexY, 0);
  vertices.push(0, -apexY, 0);

  /**
   * Anneau supérieur.
   */
  for (let index = 0; index < ringCount; index += 1) {
    const angle = (index / ringCount) * Math.PI * 2;

    vertices.push(Math.cos(angle) * radius, ringY, Math.sin(angle) * radius);
  }

  /**
   * Anneau inférieur.
   *
   * Décalage d'un demi-secteur = 36°.
   */
  for (let index = 0; index < ringCount; index += 1) {
    const angle = (index / ringCount) * Math.PI * 2 + Math.PI / ringCount;

    vertices.push(Math.cos(angle) * radius, -ringY, Math.sin(angle) * radius);
  }

  for (let index = 0; index < ringCount; index += 1) {
    const upperCurrent = upperRingStart + index;

    const upperNext = upperRingStart + ((index + 1) % ringCount);

    const lowerCurrent = lowerRingStart + index;

    const lowerNext = lowerRingStart + ((index + 1) % ringCount);

    /**
     * Face supérieure en cerf-volant :
     *
     * top
     *  → upperCurrent
     *  → lowerCurrent
     *  → upperNext
     */
    indices.push(topIndex, upperCurrent, lowerCurrent);

    indices.push(topIndex, lowerCurrent, upperNext);

    /**
     * Face inférieure opposée :
     *
     * bottom
     *  → lowerCurrent
     *  → upperNext
     *  → lowerNext
     */
    indices.push(bottomIndex, lowerCurrent, upperNext);

    indices.push(bottomIndex, upperNext, lowerNext);
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Source géométrique unique utilisée à terme par :
 * - Three.js
 * - Cannon
 * - le mapping des faces
 * - le positionnement des chiffres
 */
export function createRoll3DDieGeometry(
  sides: Roll3DPhysicalDieSides,
): THREE.BufferGeometry {
  switch (sides) {
    case 4:
      return new THREE.TetrahedronGeometry(0.82, 0);

    case 6:
      /**
       * On retire volontairement les subdivisions 2/2/2.
       * Elles n'apportent rien à la silhouette du d6 et compliqueraient
       * inutilement la topologie physique des six faces.
       */
      return new THREE.BoxGeometry(1.18, 1.18, 1.18);

    case 8:
      return new THREE.OctahedronGeometry(0.92, 0);

    case 10:
      return createD10Geometry(0.79, 1.58);

    case 12:
      return new THREE.DodecahedronGeometry(0.9, 0);

    case 20:
      return new THREE.IcosahedronGeometry(0.92, 0);
  }
}

type Roll3DTriangleFace = {
  normal: THREE.Vector3;
  center: THREE.Vector3;
};

function getRoll3DGeometryTriangles(
  geometry: THREE.BufferGeometry,
): Roll3DTriangleFace[] {
  const positionAttribute = geometry.getAttribute("position");

  if (!positionAttribute) {
    return [];
  }

  const triangles: Roll3DTriangleFace[] = [];

  const index = geometry.getIndex();

  const triangleCount = index
    ? Math.floor(index.count / 3)
    : Math.floor(positionAttribute.count / 3);

  function getVertex(vertexIndex: number): THREE.Vector3 {
    return new THREE.Vector3(
      positionAttribute.getX(vertexIndex),
      positionAttribute.getY(vertexIndex),
      positionAttribute.getZ(vertexIndex),
    );
  }

  for (
    let triangleIndex = 0;
    triangleIndex < triangleCount;
    triangleIndex += 1
  ) {
    const offset = triangleIndex * 3;

    const indexA = index ? index.getX(offset) : offset;

    const indexB = index ? index.getX(offset + 1) : offset + 1;

    const indexC = index ? index.getX(offset + 2) : offset + 2;

    const a = getVertex(indexA);
    const b = getVertex(indexB);
    const c = getVertex(indexC);

    const normal = new THREE.Vector3()
      .subVectors(b, a)
      .cross(new THREE.Vector3().subVectors(c, a))
      .normalize();

    const center = new THREE.Vector3()
      .add(a)
      .add(b)
      .add(c)
      .multiplyScalar(1 / 3);

    /**
     * Toutes nos géométries sont centrées autour de l'origine.
     * Une normale extérieure doit donc pointer globalement dans
     * la même direction que le centre de sa face.
     */
    if (normal.dot(center) < 0) {
      normal.multiplyScalar(-1);
    }

    triangles.push({
      normal,
      center,
    });
  }

  return triangles;
}

const FACE_NORMAL_MATCH_THRESHOLD = 0.9995;

function createRoll3DFaceTopologyFromGeometry(
  geometry: THREE.BufferGeometry,
): Omit<Roll3DDieFaceTopology, "value">[] {
  const triangles = getRoll3DGeometryTriangles(geometry);

  type AccumulatedFace = {
    localNormal: THREE.Vector3;
    centerSum: THREE.Vector3;
    triangleCount: number;
  };

  const accumulatedFaces: AccumulatedFace[] = [];

  for (const triangle of triangles) {
    const existingFace = accumulatedFaces.find(
      (face) =>
        face.localNormal.dot(triangle.normal) >= FACE_NORMAL_MATCH_THRESHOLD,
    );

    if (existingFace) {
      existingFace.centerSum.add(triangle.center);

      existingFace.triangleCount += 1;

      continue;
    }

    accumulatedFaces.push({
      localNormal: triangle.normal.clone(),

      centerSum: triangle.center.clone(),

      triangleCount: 1,
    });
  }

  return accumulatedFaces.map((face) => ({
    localNormal: face.localNormal.clone(),

    localCenter: face.centerSum.clone().multiplyScalar(1 / face.triangleCount),
  }));
}

const faceTopologyCache = new Map<
  Roll3DPhysicalDieSides,
  Roll3DDieFaceTopology[]
>();

export function getRoll3DDieFaceTopology(
  sides: Roll3DPhysicalDieSides,
): Roll3DDieFaceTopology[] {
  const cached = faceTopologyCache.get(sides);

  if (cached) {
    return cached;
  }

  const geometry = createRoll3DDieGeometry(sides);

  const rawFaces = createRoll3DFaceTopologyFromGeometry(geometry);

  geometry.dispose();

  /**
   * L'ordre est rendu déterministe.
   *
   * Ce mapping 1..N est encore fonctionnel.
   * Nous pourrons imposer ensuite une vraie convention de numérotation
   * opposée quand les chiffres seront visibles.
   */
  rawFaces.sort((current, next) => {
    const yDifference = next.localNormal.y - current.localNormal.y;

    if (Math.abs(yDifference) > 0.0001) {
      return yDifference;
    }

    const zDifference = next.localNormal.z - current.localNormal.z;

    if (Math.abs(zDifference) > 0.0001) {
      return zDifference;
    }

    return next.localNormal.x - current.localNormal.x;
  });

  const topology = rawFaces.map((face, index) => ({
    ...face,
    value: index + 1,
  }));

  if (__DEV__ && topology.length !== sides) {
    console.warn("[Roll3D] unexpected die topology", {
      sides,
      expectedFaces: sides,
      detectedFaces: topology.length,
    });
  }

  faceTopologyCache.set(sides, topology);

  return topology;
}

const WORLD_UP = new THREE.Vector3(0, 1, 0);

const WORLD_DOWN = new THREE.Vector3(0, -1, 0);

/**
 * Détermine quelle face d'un dé est actuellement la plus orientée vers le haut.
 *
 * Important :
 * - la topologie est définie dans l'espace local du dé ;
 * - le quaternion représente son orientation dans la scène ;
 * - chaque normale locale est donc transformée par ce quaternion ;
 * - on compare ensuite la normale obtenue à l'axe vertical mondial.
 *
 * Cette fonction ne modifie ni la physique ni le mesh.
 */
export function getRoll3DTopFace(params: {
  sides: Roll3DPhysicalDieSides;
  quaternion: THREE.Quaternion;
}): Roll3DTopFaceResult {
  const { sides, quaternion } = params;

  const topology = getRoll3DDieFaceTopology(sides);

  if (topology.length === 0) {
    throw new Error(`[Roll3D] d${sides} has no face topology.`);
  }

  const candidates = topology
    .map((face) => {
      const worldNormal = face.localNormal
        .clone()
        .applyQuaternion(quaternion)
        .normalize();

      return {
        value: face.value,
        alignment: worldNormal.dot(WORLD_UP),
      };
    })
    .sort((current, next) => next.alignment - current.alignment);

  const best = candidates[0];

  if (!best) {
    throw new Error(`[Roll3D] unable to determine top face for d${sides}.`);
  }

  const second = candidates[1] ?? best;

  return {
    value: best.value,
    alignment: best.alignment,
    confidenceGap: best.alignment - second.alignment,
  };
}

/**
 * Détermine quelle face du dé est la plus orientée vers le sol.
 *
 * Contrairement à la notion de "face supérieure",
 * cette mesure fonctionne aussi pour un d4 :
 *
 * lorsqu'un tétraèdre repose normalement,
 * sa vraie face de support possède une normale
 * presque parfaitement alignée avec WORLD_DOWN.
 *
 * Cette fonction ne modifie ni la physique ni le mesh.
 */
export function getRoll3DSupportFace(params: {
  sides: Roll3DPhysicalDieSides;
  quaternion: THREE.Quaternion;
}): Roll3DSupportFaceResult {
  const { sides, quaternion } = params;

  const topology = getRoll3DDieFaceTopology(sides);

  if (topology.length === 0) {
    throw new Error(`[Roll3D] d${sides} has no face topology.`);
  }

  const candidates = topology
    .map((face) => {
      const worldNormal = face.localNormal
        .clone()
        .applyQuaternion(quaternion)
        .normalize();

      return {
        value: face.value,

        alignment: worldNormal.dot(WORLD_DOWN),
      };
    })
    .sort((current, next) => next.alignment - current.alignment);

  const best = candidates[0];

  if (!best) {
    throw new Error(`[Roll3D] unable to determine support face for d${sides}.`);
  }

  const second = candidates[1] ?? best;

  return {
    value: best.value,

    alignment: best.alignment,

    confidenceGap: best.alignment - second.alignment,
  };
}

const convexGeometryCache = new Map<
  Roll3DPhysicalDieSides,
  Roll3DDieConvexGeometryData
>();

const CONVEX_VERTEX_PRECISION = 100000;

const CONVEX_FACE_NORMAL_THRESHOLD = 0.9995;

type Roll3DConvexTriangle = {
  indices: [number, number, number];
  normal: THREE.Vector3;
};

function getConvexVertexKey(vertex: THREE.Vector3): string {
  return [
    Math.round(vertex.x * CONVEX_VERTEX_PRECISION),
    Math.round(vertex.y * CONVEX_VERTEX_PRECISION),
    Math.round(vertex.z * CONVEX_VERTEX_PRECISION),
  ].join(":");
}

function orderConvexFaceVertexIndices(params: {
  vertexIndices: number[];
  vertices: THREE.Vector3[];
  normal: THREE.Vector3;
}): number[] {
  const { vertexIndices, vertices, normal } = params;

  if (vertexIndices.length <= 3) {
    return [...vertexIndices];
  }

  const center = new THREE.Vector3();

  for (const vertexIndex of vertexIndices) {
    const vertex = vertices[vertexIndex];

    if (vertex) {
      center.add(vertex);
    }
  }

  center.multiplyScalar(1 / vertexIndices.length);

  /**
   * Axe arbitraire non parallèle à la normale.
   */
  const referenceAxis =
    Math.abs(normal.y) < 0.9
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(1, 0, 0);

  const tangent = new THREE.Vector3()
    .crossVectors(referenceAxis, normal)
    .normalize();

  const bitangent = new THREE.Vector3()
    .crossVectors(normal, tangent)
    .normalize();

  const ordered = [...vertexIndices].sort((currentIndex, nextIndex) => {
    const currentVertex = vertices[currentIndex];

    const nextVertex = vertices[nextIndex];

    if (!currentVertex || !nextVertex) {
      return 0;
    }

    const currentRelative = new THREE.Vector3().subVectors(
      currentVertex,
      center,
    );

    const nextRelative = new THREE.Vector3().subVectors(nextVertex, center);

    const currentAngle = Math.atan2(
      currentRelative.dot(bitangent),
      currentRelative.dot(tangent),
    );

    const nextAngle = Math.atan2(
      nextRelative.dot(bitangent),
      nextRelative.dot(tangent),
    );

    return currentAngle - nextAngle;
  });

  /**
   * Vérification de l'orientation du polygone.
   */
  const a = vertices[ordered[0]];
  const b = vertices[ordered[1]];
  const c = vertices[ordered[2]];

  if (a && b && c) {
    const polygonNormal = new THREE.Vector3()
      .subVectors(b, a)
      .cross(new THREE.Vector3().subVectors(c, a))
      .normalize();

    if (polygonNormal.dot(normal) < 0) {
      ordered.reverse();
    }
  }

  return ordered;
}

export function getRoll3DDieConvexGeometryData(
  sides: Roll3DPhysicalDieSides,
): Roll3DDieConvexGeometryData {
  const cached = convexGeometryCache.get(sides);

  if (cached) {
    return cached;
  }

  const geometry = createRoll3DDieGeometry(sides);

  const positionAttribute = geometry.getAttribute("position");

  if (!positionAttribute) {
    geometry.dispose();

    throw new Error(`[Roll3D] d${sides} geometry has no position attribute.`);
  }

  const geometryIndex = geometry.getIndex();

  const vertices: THREE.Vector3[] = [];

  const vertexIndexByKey = new Map<string, number>();

  const triangles: Roll3DConvexTriangle[] = [];

  function getSourceVertex(sourceIndex: number): THREE.Vector3 {
    return new THREE.Vector3(
      positionAttribute.getX(sourceIndex),
      positionAttribute.getY(sourceIndex),
      positionAttribute.getZ(sourceIndex),
    ).multiplyScalar(ROLL3D_DIE_SCALE);
  }

  function getOrCreateVertexIndex(vertex: THREE.Vector3): number {
    const key = getConvexVertexKey(vertex);

    const existingIndex = vertexIndexByKey.get(key);

    if (existingIndex != null) {
      return existingIndex;
    }

    const nextIndex = vertices.length;

    vertices.push(vertex.clone());

    vertexIndexByKey.set(key, nextIndex);

    return nextIndex;
  }

  const triangleCount = geometryIndex
    ? Math.floor(geometryIndex.count / 3)
    : Math.floor(positionAttribute.count / 3);

  for (
    let triangleIndex = 0;
    triangleIndex < triangleCount;
    triangleIndex += 1
  ) {
    const offset = triangleIndex * 3;

    const sourceIndexA = geometryIndex ? geometryIndex.getX(offset) : offset;

    const sourceIndexB = geometryIndex
      ? geometryIndex.getX(offset + 1)
      : offset + 1;

    const sourceIndexC = geometryIndex
      ? geometryIndex.getX(offset + 2)
      : offset + 2;

    const vertexA = getSourceVertex(sourceIndexA);

    const vertexB = getSourceVertex(sourceIndexB);

    const vertexC = getSourceVertex(sourceIndexC);

    const indexA = getOrCreateVertexIndex(vertexA);

    const indexB = getOrCreateVertexIndex(vertexB);

    const indexC = getOrCreateVertexIndex(vertexC);

    if (indexA === indexB || indexB === indexC || indexA === indexC) {
      continue;
    }

    const normal = new THREE.Vector3()
      .subVectors(vertexB, vertexA)
      .cross(new THREE.Vector3().subVectors(vertexC, vertexA));

    if (normal.lengthSq() <= 0.00000001) {
      continue;
    }

    normal.normalize();

    const center = new THREE.Vector3()
      .add(vertexA)
      .add(vertexB)
      .add(vertexC)
      .multiplyScalar(1 / 3);

    /**
     * Toujours orienter la normale vers l'extérieur.
     */
    if (normal.dot(center) < 0) {
      normal.multiplyScalar(-1);

      triangles.push({
        indices: [indexA, indexC, indexB],
        normal,
      });

      continue;
    }

    triangles.push({
      indices: [indexA, indexB, indexC],
      normal,
    });
  }

  /**
   * Plusieurs triangles coplanaires doivent redevenir
   * une seule vraie face physique.
   *
   * Exemple :
   *
   * cube Three :
   * 12 triangles
   *
   * collider Cannon final :
   * 6 faces carrées.
   */
  const faceGroups: {
    normal: THREE.Vector3;
    vertexIndices: Set<number>;
  }[] = [];

  for (const triangle of triangles) {
    const existingGroup = faceGroups.find(
      (group) =>
        group.normal.dot(triangle.normal) >= CONVEX_FACE_NORMAL_THRESHOLD,
    );

    if (existingGroup) {
      triangle.indices.forEach((index) =>
        existingGroup.vertexIndices.add(index),
      );

      continue;
    }

    faceGroups.push({
      normal: triangle.normal.clone(),
      vertexIndices: new Set(triangle.indices),
    });
  }

  const faces = faceGroups
    .map((group) =>
      orderConvexFaceVertexIndices({
        vertexIndices: Array.from(group.vertexIndices),
        vertices,
        normal: group.normal,
      }),
    )
    .filter((face) => face.length >= 3);

  geometry.dispose();

  const result: Roll3DDieConvexGeometryData = {
    vertices: vertices.map((vertex) => ({
      x: vertex.x,
      y: vertex.y,
      z: vertex.z,
    })),

    faces,
  };

  if (__DEV__) {
    const expectedFaces = sides;

    if (result.faces.length !== expectedFaces) {
      console.warn("[Roll3D] unexpected convex face count", {
        sides,
        expectedFaces,
        actualFaces: result.faces.length,
        vertices: result.vertices.length,
      });
    }
  }

  convexGeometryCache.set(sides, result);

  return result;
}
