import { useRef, useEffect, useCallback, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WALK_SPEED = 8;
const FLY_SPEED = 12;
const SPRINT_SPEED = 16;
const LOOK_SPEED = 0.002;
const PLAYER_HEIGHT = 2.5;
const GRAVITY = -20;
const JUMP_FORCE = 8;

interface ControlsState {
  flying: boolean;
  sprinting: boolean;
}

export function FirstPersonControls({ onStateChange }: { onStateChange?: (state: ControlsState) => void }) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isLocked = useRef(false);
  const yVelocity = useRef(0);
  const onGround = useRef(true);
  const flying = useRef(false);
  const lastSpaceTime = useRef(0);
  const headBob = useRef(0);
  const smoothVelocity = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.set(8, PLAYER_HEIGHT, 16);
    euler.current.set(-0.15, -0.3, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
  }, [camera]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isLocked.current) return;
    euler.current.y -= e.movementX * LOOK_SPEED;
    euler.current.x -= e.movementY * LOOK_SPEED;
    euler.current.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, euler.current.x));
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = true;
    // Double-tap space to toggle fly
    if (e.code === 'Space') {
      const now = Date.now();
      if (now - lastSpaceTime.current < 300) {
        flying.current = !flying.current;
        onStateChange?.({ flying: flying.current, sprinting: keys.current['ShiftLeft'] || false });
      }
      lastSpaceTime.current = now;
    }
    if (e.code === 'KeyF') {
      flying.current = !flying.current;
      onStateChange?.({ flying: flying.current, sprinting: keys.current['ShiftLeft'] || false });
    }
  }, [onStateChange]);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = false;
  }, []);

  const onPointerLockChange = useCallback(() => {
    isLocked.current = document.pointerLockElement === gl.domElement;
  }, [gl]);

  const onClick = useCallback(() => {
    if (!isLocked.current) {
      gl.domElement.requestPointerLock();
    }
  }, [gl]);

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    gl.domElement.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      gl.domElement.removeEventListener('click', onClick);
    };
  }, [gl, onMouseMove, onKeyDown, onKeyUp, onPointerLockChange, onClick]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    camera.quaternion.setFromEuler(euler.current);

    const isSprinting = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
    const speed = flying.current ? FLY_SPEED : (isSprinting ? SPRINT_SPEED : WALK_SPEED);

    // Direction vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    if (!flying.current) {
      forward.y = 0;
      forward.normalize();
      right.y = 0;
      right.normalize();
    }

    const target = new THREE.Vector3();
    if (keys.current['KeyW'] || keys.current['ArrowUp']) target.add(forward);
    if (keys.current['KeyS'] || keys.current['ArrowDown']) target.sub(forward);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) target.add(right);
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) target.sub(right);

    if (flying.current) {
      if (keys.current['Space']) target.y += 1;
      if (keys.current['KeyC'] || keys.current['ControlLeft']) target.y -= 1;
    }

    if (target.length() > 0) target.normalize();
    target.multiplyScalar(speed * dt);

    // Smooth velocity interpolation
    smoothVelocity.current.lerp(target, flying.current ? 0.15 : 0.2);
    velocity.current.copy(smoothVelocity.current);

    if (!flying.current) {
      // Jump
      if (keys.current['Space'] && onGround.current) {
        yVelocity.current = JUMP_FORCE;
        onGround.current = false;
      }
      yVelocity.current += GRAVITY * dt;
      velocity.current.y = yVelocity.current * dt;
    }

    camera.position.add(velocity.current);

    // Ground collision (not in fly mode)
    if (!flying.current && camera.position.y < PLAYER_HEIGHT) {
      camera.position.y = PLAYER_HEIGHT;
      yVelocity.current = 0;
      onGround.current = true;
    }

    // Head bob while walking on ground
    const isMoving = target.length() > 0.01;
    if (!flying.current && onGround.current && isMoving) {
      headBob.current += dt * (isSprinting ? 14 : 10);
      camera.position.y += Math.sin(headBob.current) * 0.04;
    }

    // Expanded bounds
    camera.position.x = Math.max(-10, Math.min(30, camera.position.x));
    camera.position.z = Math.max(-10, Math.min(30, camera.position.z));
    if (flying.current) {
      camera.position.y = Math.max(1, Math.min(80, camera.position.y));
    }
  });

  return null;
}
