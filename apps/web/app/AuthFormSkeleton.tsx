import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { AppIcon } from "@/components/brand-mark";

// Mirrors AuthForm's first step box for box, so the form lands on the same
// pixels when it replaces this.
export function AuthFormSkeleton() {
  return (
    <Card
      aria-busy
      className="gap-0 rounded-2xl py-0 shadow-[0_8px_32px_-8px_rgb(0_0_0/0.12)]"
    >
      <CardHeader className="justify-items-center border-b px-6 pt-8 pb-6 [.border-b]:pb-6">
        <AppIcon size={44} className="mb-4" />
        <div className="flex h-8 items-center">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex h-5 items-center">
          <Skeleton className="h-3.5 w-60" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <FieldGroup>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <FieldSeparator />
          {/* A group directly inside a group gets a tighter gap; the form's doesn't. */}
          <div>
            <FieldGroup>
              <Field>
                <div className="flex h-[19.25px] items-center">
                  <Skeleton className="h-3.5 w-10" />
                </div>
                <Skeleton className="h-8" />
              </Field>
              <Field>
                <Skeleton className="h-10.5 rounded-[10px]" />
                <div className="flex h-5.25 items-center justify-center">
                  <Skeleton className="h-3.5 w-52" />
                </div>
              </Field>
            </FieldGroup>
          </div>
        </FieldGroup>
      </CardContent>
      <CardFooter className="justify-center px-4 py-3.5">
        <div className="flex h-[18.57px] items-center">
          <Skeleton className="h-3 w-72" />
        </div>
      </CardFooter>
    </Card>
  );
}
