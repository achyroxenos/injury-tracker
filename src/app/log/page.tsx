import { InjuryForm } from "@/components/injury/injury-form";
import { Suspense } from "react";

export default function LogPage() {
    return (
        <div className="max-w-md mx-auto">
            <Suspense>
                <InjuryForm />
            </Suspense>
        </div>
    );
}
