import { Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function HeroUITest() {
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">Hero UI Test</h3>
        </CardHeader>
        <CardBody>
          <p className="mb-4">Hero UIが正常にセットアップされました！</p>
          <div className="flex gap-2">
            <Button color="primary">Primary Button</Button>
            <Button color="secondary">Secondary Button</Button>
            <Button color="success">Success Button</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
