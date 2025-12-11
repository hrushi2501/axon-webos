import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSettingsStore } from "@/store/settings-store";

export const Particles = () => {
    const count = 2000;
    const mesh = useRef<THREE.Points>(null!);
    const { getAccentColorValue } = useSettingsStore();

    // We need to get the color in a format THREE.js understands. 
    // The store returns "r, g, b". We need to convert it to a hex or RGB object.
    const accentColorValue = getAccentColorValue();
    const color = useMemo(() => {
        const [r, g, b] = accentColorValue.split(',').map(c => parseInt(c.trim()));
        return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
    }, [accentColorValue]);

    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y 
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
        }
        return positions;
    }, [count]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (mesh.current) {
            mesh.current.rotation.y = time * 0.05;
            mesh.current.rotation.x = time * 0.02;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesPosition.length / 3}
                    array={particlesPosition}
                    itemSize={3}
                    args={[particlesPosition, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color={color}
                sizeAttenuation
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};
