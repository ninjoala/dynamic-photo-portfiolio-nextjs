import { generateLocalBusinessSchema, generateServiceSchema } from '../../utils/seo';

interface StructuredDataProps {
  includeLocalBusiness?: boolean;
  includeService?: boolean;
}

export default async function StructuredData({ 
  includeLocalBusiness = true, 
  includeService = true 
}: StructuredDataProps) {
  const localBusinessSchema = includeLocalBusiness ? generateLocalBusinessSchema() : null;
  const serviceSchema = includeService ? await generateServiceSchema() : null;

  const schemas = [];
  if (localBusinessSchema) schemas.push(localBusinessSchema);
  if (serviceSchema) schemas.push(serviceSchema);

  if (schemas.length === 0) return null;

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}