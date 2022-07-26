import { ShaderMaterial } from "three";
import { extend } from "@react-three/fiber";

class ImageShaderMaterial extends ShaderMaterial {
  constructor() {
    super({
      transparent: true,
      vertexShader: `
      #define PI 3.1415926535897932384626433832795
      varying vec2 vUv;
      varying vec3 planePosition;
      varying vec4 viewZ;
      void main() {
        viewZ = modelMatrix * vec4(position.xyz, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv = uv;
      }`,
      fragmentShader: `
      uniform sampler2D tex;
      varying vec2 vUv;
      varying vec4 viewZ;
      uniform vec2 planeDimension;
      uniform float gap;
      uniform float activeImage;
      uniform float index;
      uniform float mode;
      void main() {
        float x = vUv.x;
        float y = vUv.y;
        vec4 imageTexture = texture2D(tex, vec2((x - 0.5) * planeDimension.x + 0.5, (y - 0.5) * planeDimension.y + 0.4));
        float alphaValue = 1.0;
        if ((mode == 1.0 && (viewZ.z > 0.35 * gap || viewZ.z < -3.5 * gap)) || mode == 2.0) {
          alphaValue = 0.0;
        } else if (mode == 1.0 && viewZ.z < - gap) {
          alphaValue = 1.0 - ((abs(viewZ.z) - gap) / (3.5 * gap));
        }

        if (mode == 0.0 && index != activeImage) {
          float greyColor = (imageTexture.r + imageTexture.g + imageTexture.b) / 3.0;
          gl_FragColor = vec4(greyColor,greyColor,greyColor, 1.0);
        } else {
          gl_FragColor = vec4(imageTexture.x,imageTexture.y,imageTexture.z, alphaValue);
        }
      }`,
      uniforms: {
        tex: { value: null },
        planeDimension: {
          value: [1, 1],
        },
        activeImage: {
          value: 0,
        },
        index: {
          value: 0,
        },
        mode: {
          value: 0.0, // 0 is list image, 1 is center image
        },
        gap: {
          value: 0,
        },
      },
    });
  }

  set tex(value) {
    this.uniforms.tex.value = value;
  }

  get tex() {
    return this.uniforms.tex.value;
  }

  get planeDimension() {
    return this.uniforms.planeDimension.value;
  }

  set planeDimension(value) {
    this.uniforms.planeDimension.value = value;
  }

  get index() {
    return this.uniforms.index.value;
  }

  set index(value) {
    this.uniforms.index.value = value;
  }

  get activeImage() {
    return this.uniforms.activeImage.value;
  }

  set activeImage(value) {
    this.uniforms.activeImage.value = value;
  }

  get mode() {
    return this.uniforms.mode.value;
  }

  set mode(value) {
    this.uniforms.mode.value = value;
  }

  get gap() {
    return this.uniforms.gap.value;
  }

  set gap(value) {
    this.uniforms.gap.value = value;
  }
}

extend({ ImageShaderMaterial });
