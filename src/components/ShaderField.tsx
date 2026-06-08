"use client";

import { useEffect, useRef } from "react";

/**
 * GPU telematics field — a raw WebGL fragment shader (no 3D libraries).
 * Renders a deep-navy command-center backdrop: a sweeping radar beam,
 * range rings, a flickering sensor dot-grid ("GPS pings"), and a drifting
 * scanline. Aspect-corrected, DPR-capped, paused offscreen / on hidden tab,
 * and degrades to a single static frame under prefers-reduced-motion.
 */

type Props = {
  className?: string;
  /** 0.4 (subtle, behind content) … 1.2 (loud, full-bleed hero). */
  intensity?: number;
  /** Multiplies scroll/raf time — higher = faster sweep. */
  speed?: number;
  /** Override the CSS --accent / --data colours (e.g. keep a dark hero vivid in light mode). */
  accentHex?: string;
  dataHex?: string;
};

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform float u_intensity;
uniform vec3  u_accent;
uniform vec3  u_data;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0,0.0));
  float c = hash21(i + vec2(0.0,1.0));
  float d = hash21(i + vec2(1.0,1.0));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

void main(){
  vec2 uv  = gl_FragCoord.xy / u_res;
  float ar = u_res.x / u_res.y;
  vec2 p = uv - 0.5; p.x *= ar;
  float t = u_time;
  float I = u_intensity;

  vec3 col = mix(vec3(0.012,0.016,0.045), vec3(0.028,0.032,0.082), uv.y);

  // radar origin near the bottom-centre
  vec2 o = vec2(0.0, -0.62);
  vec2 dd = p - o;
  float rad = length(dd);
  float ang = atan(dd.x, dd.y);

  float sweep = mod(t*0.45, 6.2831853) - 3.1415927;
  float da = abs(mod(ang - sweep + 3.1415927, 6.2831853) - 3.1415927);
  float beam = smoothstep(0.85, 0.0, da) * smoothstep(1.5, 0.1, rad);
  col += u_data * beam * 0.13 * I;

  float ring = smoothstep(0.92, 1.0, sin(rad*16.0 - t*1.1));
  col += u_accent * ring * 0.05 * smoothstep(1.6, 0.15, rad) * I;

  // sensor dot-grid with ping flickers
  vec2 gp = p * 26.0;
  vec2 cell = floor(gp);
  vec2 sub = fract(gp) - 0.5;
  float pt = smoothstep(0.16, 0.02, length(sub));
  float life = hash21(cell);
  float blink = pow(sin(t*1.5 + life*30.0)*0.5 + 0.5, 4.0);
  vec3 dotCol = mix(u_accent, u_data, life);
  col += dotCol * pt * (0.035 + blink*0.4*step(0.86, life)) * I;

  // drifting horizontal scan band
  float band = abs(fract(uv.y - t*0.05) - 0.5);
  col += u_data * smoothstep(0.5, 0.46, band) * 0.02 * I;

  // soft haze
  col += u_accent * vnoise(p*3.0 + vec2(0.0, t*0.05)) * 0.02 * I;

  float vig = smoothstep(1.25, 0.2, length(p));
  col *= 0.5 + 0.5*vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function ShaderField({
  className,
  intensity = 0.8,
  speed = 1,
  accentHex,
  dataHex,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl", { antialias: false, alpha: false }) as
        | WebGLRenderingContext
        | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) {
      // No WebGL — leave the CSS gradient fallback on the element.
      canvas.style.background =
        "radial-gradient(circle at 50% 90%, #12173a, #05060f 70%)";
      return;
    }

    const prog = gl.createProgram()!;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uInt = gl.getUniformLocation(prog, "u_intensity");
    const uAccent = gl.getUniformLocation(prog, "u_accent");
    const uData = gl.getUniformLocation(prog, "u_data");

    const css = getComputedStyle(document.documentElement);
    const accent = hexToRgb(
      accentHex || (css.getPropertyValue("--accent") || "#4f6bff").trim()
    );
    const data = hexToRgb(
      dataHex || (css.getPropertyValue("--data") || "#58a6ff").trim()
    );
    gl.uniform3fv(uAccent, accent);
    gl.uniform3fv(uData, data);
    gl.uniform1f(uInt, intensity);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    let start = 0;
    let visible = true;
    let running = false;

    const draw = (ts: number) => {
      if (!start) start = ts;
      gl.uniform1f(uTime, ((ts - start) / 1000) * speed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (running) raf = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (running || reduce || !visible) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    if (reduce) {
      // single static frame
      gl.uniform1f(uTime, 2.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      startLoop();
    }

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) startLoop();
        else stopLoop();
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [intensity, speed, accentHex, dataHex]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
