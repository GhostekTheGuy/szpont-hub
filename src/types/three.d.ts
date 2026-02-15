declare module 'three' {
  export const LinearFilter: any;
  export const GLSL3: any;
  export class WebGLRenderer { [key: string]: any; constructor(...args: any[]); }
  export class Scene { [key: string]: any; constructor(...args: any[]); }
  export class OrthographicCamera { [key: string]: any; constructor(...args: any[]); }
  export class Mesh<G = any, M = any> { [key: string]: any; constructor(...args: any[]); }
  export class PlaneGeometry { [key: string]: any; constructor(...args: any[]); }
  export class ShaderMaterial { [key: string]: any; constructor(...args: any[]); }
  export class Clock { [key: string]: any; constructor(...args: any[]); }
  export class Vector2 { [key: string]: any; constructor(...args: any[]); }
  export class Color { [key: string]: any; constructor(...args: any[]); }
  export class Texture { [key: string]: any; constructor(...args: any[]); }
  export class Uniform { [key: string]: any; constructor(...args: any[]); }
  export class TextureLoader { [key: string]: any; constructor(...args: any[]); }
}

declare module 'postprocessing' {
  export class EffectComposer { [key: string]: any; constructor(...args: any[]); }
  export class RenderPass { [key: string]: any; constructor(...args: any[]); }
  export class EffectPass { [key: string]: any; constructor(...args: any[]); }
  export class Effect { [key: string]: any; constructor(...args: any[]); }
  export enum BlendFunction { NORMAL = 0, ADD = 1, SCREEN = 2, OVERLAY = 3 }
}
