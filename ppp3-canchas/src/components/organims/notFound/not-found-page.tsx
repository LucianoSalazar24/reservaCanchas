import { CardPage } from "@/components/molecules";

export function NotFoundPage() {
  return (
    <CardPage
      code={404}
      title="¡Tarjeta amarilla!"
      src="/yellow-card.png"
      description="Esta página no existe o fue expulsada del sistema."
      accentClassName="text-yellow-200"
    />
  );
}
