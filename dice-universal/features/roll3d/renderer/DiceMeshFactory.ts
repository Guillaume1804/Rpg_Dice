// dice-universal/features/roll3d/renderer/DiceMeshFactory.ts

import * as THREE from "three";

import type {
  Roll3DD100DisplayMode,
  Roll3DDieSides,
  Roll3DDieSkinId,
} from "../types";

type CreateDiceMeshParams = {
  sides: Roll3DDieSides;
  skinId?: Roll3DDieSkinId;
  d100Mode?: Roll3DD100DisplayMode;
};

type DiceSkinColors = {
  body: string;
  emissive: string;
  edge: string;
};

function getSkinColors(skinId: Roll3DDieSkinId): DiceSkinColors {
  switch (skinId) {
    case "dragon":
      return {
        body: "#190B08",
        emissive: "#3A1208",
        edge: "#FF8A3D",
      };

    case "arcane":
      return {
        body: "#111026",
        emissive: "#20145A",
        edge: "#A891FF",
      };

    case "metal":
      return {
        body: "#15171C",
        emissive: "#090A0D",
        edge: "#D8DEE9",
      };

    case "cosmic":
      return {
        body: "#070A19",
        emissive: "#111C55",
        edge: "#7FD7FF",
      };

    case "graphite_default":
    default:
      return {
        body: "#101321",
        emissive: "#241A05",
        edge: "#E8C878",
      };
  }
}

/**
 * Géométrie custom pour d10.
 *
 * Objectif :
 * - silhouette de dé décimal : deux pointes + ceinture centrale.
 * - plus proche d’un vrai d10 que ConeGeometry.
 *
 * Ce n’est pas encore le modèle final gravé/chiffré,
 * mais c’est une base correcte pour le renderer 3D V1.
 */
function createD10Geometry(radius = 0.92, height = 1.72): THREE.BufferGeometry {
  /**
   * D10 propre en bipyramide pentagonale :
   * - 1 pointe haute
   * - 1 pointe basse
   * - 5 sommets autour de l’équateur
   * - 10 faces triangulaires nettes
   *
   * Avantage immédiat :
   * aucune face n’est divisée en deux triangles visibles,
   * donc plus d’arête parasite au milieu des faces.
   */
  const vertices: number[] = [];
  const indices: number[] = [];

  const topIndex = 0;
  const bottomIndex = 1;
  const ringStart = 2;
  const ringCount = 5;

  vertices.push(0, height / 2, 0);
  vertices.push(0, -height / 2, 0);

  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2 + Math.PI / 5;

    vertices.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }

  for (let i = 0; i < ringCount; i++) {
    const current = ringStart + i;
    const next = ringStart + ((i + 1) % ringCount);

    indices.push(topIndex, current, next);
    indices.push(bottomIndex, next, current);
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

function createGeometryForSides(sides: Exclude<Roll3DDieSides, 100>) {
  switch (sides) {
    case 4:
      return new THREE.TetrahedronGeometry(0.82, 0);

    case 6:
      return new THREE.BoxGeometry(1.18, 1.18, 1.18, 2, 2, 2);

    case 8:
      return new THREE.OctahedronGeometry(0.92, 0);

    case 10:
      return createD10Geometry(0.88, 1.58);

    case 12:
      return new THREE.DodecahedronGeometry(0.9, 0);

    case 20:
      return new THREE.IcosahedronGeometry(0.92, 0);

    default:
      return new THREE.BoxGeometry(1.18, 1.18, 1.18);
  }
}

function createSingleDiceMesh(params: {
  sides: Exclude<Roll3DDieSides, 100>;
  skinId: Roll3DDieSkinId;
}): THREE.Group {
  const { sides, skinId } = params;
  const colors = getSkinColors(skinId);

  const group = new THREE.Group();
  group.name = `d${sides}`;

  const geometry = createGeometryForSides(sides);

  const material = new THREE.MeshStandardMaterial({
    color: colors.body,
    roughness: 0.48,
    metalness: 0.2,
    emissive: colors.emissive,
    emissiveIntensity: 0.16,
  });

  const body = new THREE.Mesh(geometry, material);
  body.name = `d${sides}-body`;
  body.castShadow = false;
  body.receiveShadow = false;

  group.add(body);

  const edgeGeometry = new THREE.EdgesGeometry(geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: colors.edge,
    transparent: true,
    opacity: 0.74,
  });

  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  edges.name = `d${sides}-edges`;

  group.add(edges);

  return group;
}

function createSingleOracleD100Mesh(params: {
  skinId: Roll3DDieSkinId;
}): THREE.Group {
  const { skinId } = params;
  const colors = getSkinColors(skinId);

  const group = new THREE.Group();
  group.name = "d100-single-oracle";

  const geometry = new THREE.IcosahedronGeometry(0.95, 1);

  const material = new THREE.MeshStandardMaterial({
    color: colors.body,
    roughness: 0.5,
    metalness: 0.18,
    emissive: colors.emissive,
    emissiveIntensity: 0.16,
  });

  const body = new THREE.Mesh(geometry, material);
  body.name = "d100-single-oracle-body";

  group.add(body);

  const edgeGeometry = new THREE.EdgesGeometry(geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: colors.edge,
    transparent: true,
    opacity: 0.66,
  });

  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  edges.name = "d100-single-oracle-edges";

  group.add(edges);

  return group;
}

function createPercentileD100Group(params: {
  skinId: Roll3DDieSkinId;
}): THREE.Group {
  const { skinId } = params;

  const group = new THREE.Group();
  group.name = "d100-percentile-pair";

  const tensDie = createSingleDiceMesh({
    sides: 10,
    skinId,
  });

  const unitsDie = createSingleDiceMesh({
    sides: 10,
    skinId,
  });

  tensDie.name = "d100-tens-die";
  unitsDie.name = "d100-units-die";

  /**
   * Deux d10 côte à côte :
   * - gauche : dizaines, futur marquage 00-90
   * - droite : unités, futur marquage 0-9
   */
  tensDie.position.set(-0.76, 0.34, 0);
  unitsDie.position.set(0.76, 0.34, 0);

  tensDie.rotation.set(0.08, -0.22, -0.08);
  unitsDie.rotation.set(-0.08, 0.22, 0.08);

  tensDie.scale.setScalar(0.68);
  unitsDie.scale.setScalar(0.68);

  group.add(tensDie);
  group.add(unitsDie);

  group.position.y = 0.12;

  return group;
}

export function createDiceMesh({
  sides,
  skinId = "graphite_default",
  d100Mode = "percentile_pair",
}: CreateDiceMeshParams): THREE.Group {
  if (sides === 100) {
    if (d100Mode === "single_oracle") {
      return createSingleOracleD100Mesh({
        skinId,
      });
    }

    return createPercentileD100Group({
      skinId,
    });
  }

  return createSingleDiceMesh({
    sides,
    skinId,
  });
}
