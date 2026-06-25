"use client";

import { Users, UserX } from "lucide-react";
import { Row, Col } from "antd";
import { setMemberUploadsPolicyAction } from "./actions";
import { PolicyCardButton } from "./PolicyCardButton";

export function MemberUploadsPolicy({
  allowMemberUploads,
}: {
  allowMemberUploads: boolean;
}) {
  return (
    <Row gutter={[12, 12]}>
      <Col xs={24} sm={12}>
        <form action={setMemberUploadsPolicyAction}>
          <input type="hidden" name="allow_member_uploads" value="1" />
          <PolicyCardButton
            active={allowMemberUploads}
            icon={<Users size={20} />}
            title="Allow teammates to post here"
            body="Members can pick this workspace in the desktop chip and record into it."
          />
        </form>
      </Col>
      <Col xs={24} sm={12}>
        <form action={setMemberUploadsPolicyAction}>
          <input type="hidden" name="allow_member_uploads" value="0" />
          <PolicyCardButton
            active={!allowMemberUploads}
            icon={<UserX size={20} />}
            title="Only the workspace owner"
            body="Teammate uploads fall back to their personal workspace."
          />
        </form>
      </Col>
    </Row>
  );
}
