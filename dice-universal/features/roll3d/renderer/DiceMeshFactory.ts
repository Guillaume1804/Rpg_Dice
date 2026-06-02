// dice-universal/features/roll3d/renderer/DiceMeshFactory.ts

import * as THREE from "three";

import type { Roll3DDieSides, Roll3DDieSkinId } from "../types";

type CreateDiceMeshParams = {
    sides: Roll3DDieSides;
    skinId?: Roll3DDieSkinId;
};

function createGeometryForSides(sides: Roll3DDieSides): THREE.BufferGeometry {
    switch (sides) {
        case 4:
            return new THREE.TetrahedronGeometry(0.82, 0);

        case 6:
            return new THREE.BoxGeometry(1.18, 1.18, 1.18, 2, 2, 2);

        case 8:
            return new THREE.OctahedronGeometry(0.92, 0);

        case 10:
            /**
             * Provisoire : bipyramide proche visuellement d’un d10.
             * On raffinera plus tard avec une vraie géométrie d10.
             */
            return new THREE.ConeGeometry(0.82, 1.45, 10, 1);

        case 12:
            return new THREE.DodecahedronGeometry(0.9, 0);

        case 20:
            return new THREE.IcosahedronGeometry(0.92, 0);

        case 100:
            /**
             * Provisoire : d100 stylisé comme une sphère facettée.
             * Plus tard : paire d10/d% ou modèle dédié.
             */
            return new THREE.IcosahedronGeometry(0.95, 1);

        default:
            return new THREE.BoxGeometry(1.18, 1.18, 1.18);
    }
}

function getSkinColors(skinId: Roll3DDieSkinId) {
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

export function createDiceMesh({
    sides,
    skinId = "graphite_default",
}: CreateDiceMeshParams): THREE.Group {
    const colors = getSkinColors(skinId);
    const group = new THREE.Group();

    const geometry = createGeometryForSides(sides);

    const material = new THREE.MeshStandardMaterial({
        color: colors.body,
        roughness: 0.48,
        metalness: 0.2,
        emissive: colors.emissive,
        emissiveIntensity: 0.16,
    });

    const body = new THREE.Mesh(geometry, material);
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
    group.add(edges);

    /**
     * Petit halo sous le dé.
     * Ce n’est pas une ombre physique, mais un repère visuel premium léger.
     */
    const haloGeometry = new THREE.CircleGeometry(0.82, 32);
    const haloMaterial = new THREE.MeshBasicMaterial({
        color: colors.edge,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
    });

    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -0.66;

    group.add(halo);

    return group;
}