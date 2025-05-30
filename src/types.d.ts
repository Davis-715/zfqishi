declare module 'three/examples/jsm/controls/OrbitControls' {
  export { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
}

declare module 'three/examples/jsm/postprocessing/EffectComposer' {
  export { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
}

declare module 'three/examples/jsm/postprocessing/RenderPass' {
  export { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass' {
  export { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
}

// 扩展THREE.Points类型
declare namespace THREE {
  class Points<TGeometry extends BufferGeometry = BufferGeometry, TMaterial extends Material | Material[] = Material | Material[]> extends Object3D {
    geometry: TGeometry;
    material: TMaterial;
  }
}