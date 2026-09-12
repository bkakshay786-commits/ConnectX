import { PlaceholderPage } from "@/components/feedback/PlaceholderPage";

interface NamedPlaceholderProps {
  title: string;
}

export function NamedPlaceholder({ title }: NamedPlaceholderProps) {
  return (
    <PlaceholderPage
      title={title}
      description="This surface is specified in the architecture and will be built from the matching prototype."
    />
  );
}
