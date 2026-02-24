import { Canvas, useFrame } from "@react-three/fiber/native";
import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import * as THREE from "three";

function Ball({ rotX, rotY }) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.rotation.x = rotX.value;
    mesh.current.rotation.y = rotY.value;
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="white" wireframe />
    </mesh>
  );
}

export default function App() {
  const rotX = useSharedValue(0);
  const rotY = useSharedValue(0);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = rotX.value;
      startY.value = rotY.value;
    })
    .onUpdate((e) => {
      rotX.value = startX.value + e.translationY * 0.01;
      rotY.value = startY.value + e.translationX * 0.01;
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        {/* ✅ stable wrapper */}
        <View style={styles.canvasWrapper}>
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <color attach="background" args={["#87CEEB"]} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Ball rotX={rotX} rotY={rotY} />
          </Canvas>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvasWrapper: {
    flex: 1,
  },
});
