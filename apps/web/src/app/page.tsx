import Header from "@web/components/Header";

export default function Home() {
	return (
		<>
			<Header />
			<main className="flex flex-1 items-center justify-center">
				<h1 className="text-4xl font-bold text-blue-600">Hello, Tailwind!</h1>
			</main>
		</>
	);
}
