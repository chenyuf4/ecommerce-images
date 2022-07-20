import { ShaderMaterial } from "three";
import { extend } from "@react-three/fiber";

class ProgressBarShaderMaterial extends ShaderMaterial {
  constructor() {
    super({
      transparent: true,
      vertexShader: `
        #define PI 3.1415926535897932384626433832795
        varying vec3 pos;
        void main() {
            pos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
      varying vec3 pos;
      uniform float left;
      uniform float right;
      void main() {
        float x = pos.x;
        if (x <= right && x >= left) {
          gl_FragColor = vec4(0.,0.,0.,1.);
        } else {
          gl_FragColor = vec4(219./255.,218./255.,216./255.,1.0);
        }
      }`,
      uniforms: {
        left: {
          value: 0,
        },
        right: {
          value: 0,
        },
      },
    });
  }

  set left(value) {
    this.uniforms.left.value = value;
  }

  get left() {
    return this.uniforms.left.value;
  }

  set right(value) {
    this.uniforms.right.value = value;
  }

  get right() {
    return this.uniforms.right.value;
  }
}

extend({ ProgressBarShaderMaterial });
