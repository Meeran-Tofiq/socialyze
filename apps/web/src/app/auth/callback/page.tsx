import { Suspense } from "react";
import AuthCallbackPage from "@web/components/AuthCallback";

export const dynamic = "force-dynamic"; // disable static generation

export default function Page() {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<AuthCallbackPage />
		</Suspense>
	);
}
