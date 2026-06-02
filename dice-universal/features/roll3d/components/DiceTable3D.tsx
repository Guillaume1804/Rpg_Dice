// dice-universal/features/roll3d/components/DiceTable3D.tsx

import { useEffect, useRef } from "react";
import { View } from "react-native";
import { GLView, type ExpoWebGLRenderingContext } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";

import { createDiceMesh } from "../renderer/DiceMeshFactory";
import type { Roll3DDieSides } from "../types";

type DiceTable3DProps = {
    height?: number;
    previewSides?: Roll3DDieSides;
};

function disposeObject3D(object: THREE.Object3D) {
    object.traverse((child) => {
        const mesh = child as THREE.Mesh;

        if (mesh.geometry) {
            mesh.geometry.dispose();
        }

        const material = mesh.material;

        if (Array.isArray(material)) {
            material.forEach((item) => item.dispose());
        } else if (material) {
            material.dispose();
        }
    });
}

export function DiceTable3D({
    height = 320,
    previewSides = 20,
}: DiceTable3DProps) {
    const animationFrameRef = useRef<number | null>(null);

    const sceneRef = useRef<THREE.Scene | null>(null);
    const diceRef = useRef<THREE.Group | null>(null);
    const currentPreviewSidesRef = useRef<Roll3DDieSides | null>(null);

    useEffect(() => {
        return () => {
            if (animationFrameRef.current != null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;

        if (!scene) return;
        if (currentPreviewSidesRef.current === previewSides) return;

        if (diceRef.current) {
            scene.remove(diceRef.current);
            disposeObject3D(diceRef.current);
        }

        const nextDice = createDiceMesh({
            sides: previewSides,
            skinId: "graphite_default",
        });

        nextDice.position.set(0, 0.05, 0);

        scene.add(nextDice);

        diceRef.current = nextDice;
        currentPreviewSidesRef.current = previewSides;
    }, [previewSides]);

    function handleContextCreate(gl: ExpoWebGLRenderingContext) {
        const { drawingBufferWidth: width, drawingBufferHeight: bufferHeight } = gl;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#060812");

        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            45,
            width / bufferHeight,
            0.1,
            100,
        );

        camera.position.set(0, 3.2, 6.2);
        camera.lookAt(0, 0, 0);

        const renderer = new Renderer({ gl });
        renderer.setSize(width, bufferHeight);
        renderer.setClearColor("#060812");

        const ambientLight = new THREE.AmbientLight("#E8C878", 0.42);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight("#FFFFFF", 1.35);
        keyLight.position.set(3, 5, 4);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight("#7C5CFF", 0.85);
        rimLight.position.set(-4, 2.5, -3);
        scene.add(rimLight);

        const tableGeometry = new THREE.PlaneGeometry(8, 8);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: "#0B0E1A",
            roughness: 0.86,
            metalness: 0.08,
        });

        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.rotation.x = -Math.PI / 2;
        table.position.y = -1.05;
        scene.add(table);

        const dice = createDiceMesh({
            sides: previewSides,
            skinId: "graphite_default",
        });

        dice.position.set(0, 0.05, 0);
        scene.add(dice);

        diceRef.current = dice;
        currentPreviewSidesRef.current = previewSides;

        const clock = new THREE.Clock();

        const render = () => {
            const elapsed = clock.getElapsedTime();

            const currentDice = diceRef.current;

            if (currentDice) {
                currentDice.rotation.x = elapsed * 0.42;
                currentDice.rotation.y = elapsed * 0.62;
                currentDice.rotation.z = Math.sin(elapsed * 0.7) * 0.08;
            }

            renderer.render(scene, camera);
            gl.endFrameEXP();

            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();
    }

    return (
        <View
            style={{
                height,
                width: "100%",
                borderRadius: 28,
                overflow: "hidden",
                backgroundColor: "#060812",
            }}
        >
            <GLView
                style={{
                    flex: 1,
                }}
                onContextCreate={handleContextCreate}
            />
        </View>
    );
}