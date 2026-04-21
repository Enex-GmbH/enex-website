export function LegalSectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="mt-10 mb-4 text-xl font-semibold text-gray-900 first:mt-0">
      {children}
    </h2>
  );
}

export function LegalSubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 mb-3 text-lg font-semibold text-gray-900">{children}</h3>
  );
}
