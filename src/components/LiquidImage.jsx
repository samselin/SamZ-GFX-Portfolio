// src/components/LiquidImage.jsx
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'

const LiquidShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: null },
    uHoverState: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
    uImageRes: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform float uHoverState;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec2 uImageRes;

    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Object-fit: cover math
      vec2 s = uResolution;
      vec2 i = uImageRes;
      float rs = s.x / s.y;
      float ri = i.x / i.y;
      vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
      vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
      vec2 uv = vUv * s / new + offset;

      // Distance from mouse to UV
      float dist = distance(vUv, uMouse);
      
      // Calculate a liquid ripple effect based on noise and time
      float noiseVal = snoise(vUv * 4.0 + uTime * 0.5);
      
      // Create a localized bulge/ripple near the mouse
      float ripple = sin(dist * 12.0 - uTime * 3.0) * exp(-dist * 6.0);
      
      vec2 displacement = vec2(noiseVal, ripple) * 0.06 * uHoverState;
      vec2 displacedUv = uv + displacement;

      vec4 color = texture2D(uTexture, displacedUv);
      gl_FragColor = color;
    }
  `
}

function Scene({ src }) {
  const meshRef = useRef()
  const texture = useTexture(src)
  const { size, viewport } = useThree()
  
  // Create shader material
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: LiquidShaderMaterial.vertexShader,
      fragmentShader: LiquidShaderMaterial.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: texture },
        uHoverState: { value: 0.0 }, // Initialize to 0.0
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uImageRes: { value: new THREE.Vector2(texture.image.width, texture.image.height) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
      }
    })
    return mat
  }, [texture, size.width, size.height])

  useFrame((state) => {
    if (material) {
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  // Smooth mouse coordinates via proxy object and GSAP
  const currentMouse = useMemo(() => ({ x: 0.5, y: 0.5 }), [])

  const onPointerMove = (e) => {
    // Normalizing UV mouse coordinates from top-left (0,0) to bottom-right (1,1) -> actually R3F uv is bottom-left (0,0) to top-right (1,1)
    gsap.to(currentMouse, {
      x: e.uv.x,
      y: e.uv.y,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => {
        if (material) material.uniforms.uMouse.value.set(currentMouse.x, currentMouse.y)
      }
    })
  }

  const hoverStateProxy = useMemo(() => ({ value: 0 }), [])

  const onPointerOver = () => {
    gsap.to(hoverStateProxy, {
      value: 1,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        if (material) material.uniforms.uHoverState.value = hoverStateProxy.value
      }
    })
  }

  const onPointerOut = () => {
    gsap.to(hoverStateProxy, {
      value: 0,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        if (material) material.uniforms.uHoverState.value = hoverStateProxy.value
      }
    })
  }

  return (
    <mesh
      ref={meshRef}
      onPointerMove={onPointerMove}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <planeGeometry args={[viewport.width, viewport.height, 32, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

export default function LiquidImage({ src, alt, className }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Absolute fallback image */}
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.5 }}
      />
      {/* WebGL Canvas Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <Canvas
          camera={{ position: [0, 0, 1] }} // Simple ortho-like projection if scaled right
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Scene src={src} />
        </Canvas>
      </div>
    </div>
  )
}
