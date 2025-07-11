/* eslint-disable ts/no-use-before-define */
'use client';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

const minSize = 400;

type Segment = {
  text?: string;
  color: string;
  image?: string;
};

type WheelComponentProps = {
  ref?: React.Ref<any>;
  segments?: Segment[];
  winningSegment?: string;
  onFinished?: () => void;
  primaryColor?: string;
  contrastColor?: string;
  buttonText?: string;
  isOnlyOnce?: boolean;
  fontFamily?: string;
  fontSize?: string;
  outlineWidth?: number;
};

const WheelComponent = function WheelComponent(
  { ref, segments = [], winningSegment = '', onFinished = () => {}, primaryColor = 'black', contrastColor = 'white', buttonText = 'Spin', isOnlyOnce = true, fontFamily = 'proxima-nova', fontSize = '1em', outlineWidth = 10 }: WheelComponentProps,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageCache, setImageCache] = useState<{ [key: string]: HTMLImageElement }>({});
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [angleCurrent, setAngleCurrent] = useState(0);
  const [angleDelta, setAngleDelta] = useState(0);
  const timerHandle = useRef<NodeJS.Timeout | null>(null);
  const [spinTime, setSpinTime] = useState(0);
  const [spinStart, setSpinStart] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [currentSegment, setCurrentSegment] = useState<any>(null);

  // Wheel dimensions
  const [dimension, setDimension] = useState(minSize);
  const [size, setSize] = useState(minSize / 2 - 20);
  const [center, setCenter] = useState({ x: minSize / 2, y: minSize / 2 });

  // Preload images
  useEffect(() => {
    let isMounted = true;
    async function preloadImages() {
      const cache: { [key: string]: HTMLImageElement } = {};
      const promises = segments
        .filter(seg => seg.image)
        .map(
          seg =>
            new Promise<void>((resolve) => {
              const img = new window.Image();
              img.onload = () => {
                if (seg.image) {
                  cache[seg.image] = img;
                }
                resolve();
              };
              img.onerror = () => resolve();
              img.src = seg.image!;
            }),
        );
      await Promise.all(promises);
      if (isMounted) {
        setImageCache(cache);
        setImagesLoaded(true);
      }
    }
    preloadImages();
    return () => {
      isMounted = false;
    };
  }, [segments]);

  // Resize canvas on mount
  useEffect(() => {
    function handleResize() {
      const containerSize = Math.max(window.innerWidth - 40, minSize);
      setDimension(containerSize);
      setSize(containerSize / 2 - 20);
      setCenter({ x: containerSize / 2, y: containerSize / 2 });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redraw wheel when segments or angle change
  useEffect(() => {
    if (imagesLoaded) {
      draw();
    }
  }, [segments, angleCurrent, imagesLoaded]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerHandle.current) {
        clearInterval(timerHandle.current);
      }
    };
  }, []);

  // Draw the wheel
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !segments.length) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, dimension, dimension);

    // Draw segments
    let lastAngle = angleCurrent;
    const len = segments.length;
    const PI2 = Math.PI * 2;
    ctx.lineWidth = 1;
    ctx.strokeStyle = primaryColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = `1em ${fontFamily}`;

    for (let i = 1; i <= len; i++) {
      const angle = PI2 * (i / len) + angleCurrent;
      drawSegment(ctx, i - 1, lastAngle, angle);
      lastAngle = angle;
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(center.x, center.y, 50, 0, PI2, false);
    ctx.closePath();
    ctx.fillStyle = primaryColor;
    ctx.lineWidth = 10;
    ctx.strokeStyle = contrastColor;
    ctx.fill();
    ctx.font = `bold 1em ${fontFamily}`;
    ctx.fillStyle = contrastColor;
    ctx.textAlign = 'center';
    ctx.fillText(buttonText, center.x, center.y + 3);
    ctx.stroke();

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(center.x, center.y, size, 0, PI2, false);
    ctx.closePath();
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = primaryColor;
    ctx.stroke();

    // Draw needle
    drawNeedle(ctx);
  }, [segments, angleCurrent, imagesLoaded, dimension, size, center, primaryColor, contrastColor, fontFamily, fontSize, outlineWidth, buttonText]);

  function drawSegment(ctx: CanvasRenderingContext2D, key: number, lastAngle: number, angle: number) {
    const segment = segments[key];
    // Draw slice
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, size, lastAngle, angle, false);
    ctx.lineTo(center.x, center.y);
    ctx.closePath();
    ctx.fillStyle = segment ? segment.color : '#fff';
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Draw image if any
    ctx.save();
    const midAngle = (lastAngle + angle) / 2;
    ctx.translate(center.x, center.y);
    ctx.rotate(midAngle);

    if (segment && segment.image && imagesLoaded && imageCache[segment.image]) {
      const img = imageCache[segment.image];
      const imgSize = 45;
      const imageRadius = size * 0.6;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const imgX = Math.cos(midAngle) * imageRadius;
      const imgY = Math.sin(midAngle) * imageRadius;
      ctx.translate(center.x + imgX, center.y + imgY);
      ctx.rotate(midAngle + Math.PI / 2);
      if (img) {
        ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
      }
      ctx.restore();
    }

    // Draw text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = contrastColor;
    ctx.font = `bold ${fontSize} ${fontFamily}`;
    const textRadius = size * 0.8;
    ctx.save();
    ctx.translate(textRadius, 0);
    ctx.rotate(Math.PI / 2);
    if (segment && segment.text) {
      ctx.fillText(segment.text, 0, 0);
    }
    ctx.restore();

    ctx.restore();
  }

  function drawNeedle(ctx: CanvasRenderingContext2D) {
    if (!segments.length) {
      return;
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = contrastColor;
    ctx.fillStyle = contrastColor;
    ctx.beginPath();
    ctx.moveTo(center.x + 20, center.y - 50);
    ctx.lineTo(center.x - 20, center.y - 50);
    ctx.lineTo(center.x, center.y - 70);
    ctx.closePath();
    ctx.fill();

    // Tính toán segment hiện tại nhưng không set state ở đây
    const change = angleCurrent + Math.PI / 2;
    let i = segments.length - Math.floor((change / (Math.PI * 2)) * segments.length) - 1;
    if (i < 0) {
      i = i + segments.length;
    }
    // setCurrentSegment(segments[i]); // Không set state trong draw
  }

  // Spin logic
  const startSpin = useCallback((time = 3000) => {
    if (!imagesLoaded) {
      setTimeout(() => startSpin(time), 100);
      return;
    }
    if (timerHandle.current) {
      clearInterval(timerHandle.current);
      timerHandle.current = null;
    }
    setSpinTime(time);
    setIsStarted(true);
    setIsFinished(false);
    setAngleCurrent(0);
    setSpinStart(Date.now());
    setMaxSpeed(Math.PI / time);

    timerHandle.current = setInterval(() => onTimerTick(), segments.length);
  }, [imagesLoaded, segments.length]);

  const onTimerTick = useCallback(() => {
    const duration = Date.now() - spinStart;
    let progress = 0;
    let finished = false;
    let newAngleDelta = angleDelta;
    let newAngleCurrent = angleCurrent;

    if (duration < spinTime * 0.4) {
      progress = duration / (spinTime * 0.4);
      newAngleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2);
    } else {
      progress = (duration - spinTime * 0.4) / (spinTime * 0.6);
      newAngleDelta = maxSpeed * Math.cos((progress * Math.PI) / 2);
      if (progress >= 1) {
        finished = true;
      }
    }

    newAngleCurrent += newAngleDelta;
    while (newAngleCurrent >= Math.PI * 2) {
      newAngleCurrent -= Math.PI * 2;
    }

    setAngleDelta(newAngleDelta);
    setAngleCurrent(newAngleCurrent);

    if (finished) {
      setIsFinished(true);
      if (timerHandle.current) {
        clearInterval(timerHandle.current);
        timerHandle.current = null;
      }
      setAngleDelta(0);

      // Tính toán segment trúng thưởng
      const change = newAngleCurrent + Math.PI / 2;
      let i = segments.length - Math.floor((change / (Math.PI * 2)) * segments.length) - 1;
      if (i < 0) {
        i = i + segments.length;
      }
      setCurrentSegment(segments[i]);
      if (onFinished && typeof onFinished === 'function') {
        onFinished();
      }
    }
  }, [spinStart, spinTime, angleDelta, angleCurrent, maxSpeed, segments, onFinished]);

  // Public API for parent
  useImperativeHandle(
    ref,
    () => ({
      startSpin,
      preloadImages: async () => {}, // đã preload ở useEffect
      canvasContext: canvasRef.current ? canvasRef.current.getContext('2d') : null,
    }),
    [startSpin, imagesLoaded],
  );

  return (
    <div style={{ width: dimension, height: dimension, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={dimension}
        height={dimension}
        style={{ width: dimension, height: dimension, background: '#fff' }}
      />
      <button
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 2,
          padding: '1em 2em',
          fontSize: '1.2em',
          borderRadius: '50%',
          border: '2px solid #f00',
          background: '#fff',
          cursor: 'pointer',
        }}
        disabled={isStarted && !isFinished}
        onClick={() => startSpin(3000)}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default WheelComponent;
