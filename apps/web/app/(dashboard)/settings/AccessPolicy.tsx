"use client";

import { Globe, Lock } from "lucide-react";
import { Row, Col } from "antd";
import { setPublicLinksPolicyAction } from "./actions";
import { PolicyCardButton } from "./PolicyCardButton";

export function AccessPolicy({
  allowPublicLinks,
}: {
  allowPublicLinks: boolean;
}) {
  return (
    <Row gutter={[12, 12]}>
      <Col xs={24} sm={12}>
        <form action={setPublicLinksPolicyAction}>
          <input type="hidden" name="allow_public_links" value="1" />
          <PolicyCardButton
            active={allowPublicLinks}
            icon={<Globe size={20} />}
            title="Allow public links"
            body="Members can share recordings + snaps to anyone with the URL."
          />
        </form>
      </Col>
      <Col xs={24} sm={12}>
        <form action={setPublicLinksPolicyAction}>
          <input type="hidden" name="allow_public_links" value="0" />
          <PolicyCardButton
            active={!allowPublicLinks}
            icon={<Lock size={20} />}
            title="Only workspace members can view"
            body="Public visibility is hidden; new uploads default to workspace-only."
          />
        </form>
      </Col>
    </Row>
  );
}
