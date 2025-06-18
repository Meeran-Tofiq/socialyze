"use client";
import { useEffect, useRef } from "react";

interface Star {
	x: number;
	y: number;
	size: number;
	speedX: number;
	speedY: number;
	opacity: number;
}

export default function StarryBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let animationId: number;

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		const stars: Star[] = [];
		const numStars = 100;

		for (let i = 0; i < numStars; i++) {
			stars.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				size: Math.random() * 2 + 1,
				speedX: (Math.random() - 0.5) * 0.2,
				speedY: (Math.random() - 0.5) * 0.2,
				opacity: Math.random() * 0.5 + 0.2,
			});
		}

		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			stars.forEach((star) => {
				star.x += star.speedX;
				star.y += star.speedY;

				if (star.x < 0) star.x = canvas.width;
				if (star.x > canvas.width) star.x = 0;
				if (star.y < 0) star.y = canvas.height;
				if (star.y > canvas.height) star.y = 0;

				ctx.beginPath();
				ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
				ctx.fill();
			});

			animationId = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	}, []);

	return (
		<canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }} />
	);
}
