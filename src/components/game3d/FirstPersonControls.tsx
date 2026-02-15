import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MOVE_SPEED = 8;
const LOOK_SPEED = 0.002;
const PLAYER_HEIGHT = 2.5;
const GRAVITY = -20;
const JUMP_FORCE = 8;

export function FirstPersonControls() {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isLocked = useRef(false);
  const yVelocity = useRef(0);
  const onGround = useRef(true);

  useEffect(() => {
    camera.position.set(5, PLAYER_HEIGHT, 12);
    euler.current.set(-0.2, 0, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
  }, [camera]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isLocked.current) return;
    euler.current.y -= e.movementX * LOOK_SPEED;
    euler.current.x -= e.movementY * LOOK_SPEED;
    euler.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.current.x));
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = true;
  }, []);

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

    // Apply rotation
    camera.quaternion.setFromEuler(euler.current);

    // Movement
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    velocity.current.set(0, 0, 0);
    if (keys.current['KeyW'] || keys.current['ArrowUp']) velocity.current.add(forward);
    if (keys.current['KeyS'] || keys.current['ArrowDown']) velocity.current.sub(forward);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) velocity.current.add(right);
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) velocity.current.sub(right);

    if (velocity.current.length() > 0) velocity.current.normalize();
    velocity.current.multiplyScalar(MOVE_SPEED * dt);

    // Jump
    if (keys.current['Space'] && onGround.current) {
      yVelocity.current = JUMP_FORCE;
      onGround.current = false;
    }

    // Gravity
    yVelocity.current += GRAVITY * dt;
    velocity.current.y = yVelocity.current * dt;

    camera.position.add(velocity.current);

    // Ground collision
    if (camera.position.y < PLAYER_HEIGHT) {
      camera.position.y = PLAYER_HEIGHT;
      yVelocity.current = 0;
      onGround.current = true;
    }

    // Keep in bounds
    camera.position.x = Math.max(-2, Math.min(22, camera.position.x));
    camera.position.z = Math.max(-2, Math.min(22, camera.position.z));
  });

  return null;
}
