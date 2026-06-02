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
    const vertices: number[] = [];
    const indices: number[] = [];

    const topIndex = 0;
    const bottomIndex = 1;

    vertices.push(0, height / 2, 0);
    vertices.push(0, -height / 2, 0);

    const ringStart = 2;
    const ringY = 0;
    const ringCount = 10;

    for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2 + Math.PI / 10;
        const yOffset = i % 2 === 0 ? height * 0.12 : -height * 0.12;

        vertices.push(
            Math.cos(angle) * radius,
            ringY + yOffset,
            Math.sin(angle) * radius,
        );
    }

    /**
     * D10 / pentagonal trapezohedron :
     * - 5 faces autour de la pointe haute
     * - 5 faces autour de la pointe basse
     *
     * Chaque face réelle est un losange/kite.
     * On la triangule pour Three.js, mais on évitera ensuite
     * d’afficher les diagonales internes comme des arêtes.
     */
    for (let i = 0; i < ringCount; i += 2) {
        const a = ringStart + i;
        const b = ringStart + ((i + 1) % ringCount);
        const c = ringStart + ((i + 2) % ringCount);
        const previous = ringStart + ((i + ringCount - 1) % ringCount);

        indices.push(topIndex, a, b);
        indices.push(topIndex, b, c);

        indices.push(bottomIndex, previous, a);
        indices.push(bottomIndex, a, b);
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
    );

    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.normalizeNormals();

    return geometry;
}

function createD10EdgeLines(
    radius = 0.92,
    height = 1.72,
    color = "#E8C878",
): THREE.LineSegments {
    const points: number[] = [];

    const top = new THREE.Vector3(0, height / 2, 0);
    const bottom = new THREE.Vector3(0, -height / 2, 0);

    const ring: THREE.Vector3[] = [];

    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 + Math.PI / 10;
        const yOffset = i % 2 === 0 ? height * 0.12 : -height * 0.12;

        ring.push(
            new THREE.Vector3(
                Math.cos(angle) * radius,
                yOffset,
                Math.sin(angle) * radius,
            ),
        );
    }

    function addLine(a: THREE.Vector3, b: THREE.Vector3) {
        points.push(a.x, a.y, a.z);
        points.push(b.x, b.y, b.z);
    }

    for (let i = 0; i < 10; i++) {
        const current = ring[i];
        const next = ring[(i + 1) % 10];

        addLine(current, next);

        if (i % 2 === 0) {
            addLine(top, current);
            addLine(top, next);
        } else {
            addLine(bottom, current);
            addLine(bottom, next);
        }
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(points, 3),
    );

    const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.72,
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.name = "d10-clean-edges";

    return lines;
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

    if (sides === 10) {
        const edges = createD10EdgeLines(0.92, 1.72, colors.edge);
        edges.name = `d${sides}-edges`;
        group.add(edges);
    } else {
        const edgeGeometry = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: colors.edge,
            transparent: true,
            opacity: 0.74,
        });

        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edges.name = `d${sides}-edges`;

        group.add(edges);
    }

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
    tensDie.position.set(-0.78, 0.18, 0);
    unitsDie.position.set(0.78, 0.18, 0);

    tensDie.rotation.set(0.12, -0.26, -0.12);
    unitsDie.rotation.set(-0.1, 0.26, 0.12);

    tensDie.scale.setScalar(0.74);
    unitsDie.scale.setScalar(0.74);

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