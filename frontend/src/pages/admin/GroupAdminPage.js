import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Row, Col, Card, Badge, Button, ListGroup } from "react-bootstrap";
import { fetchGroupDetailById } from "../../api/groupApi";

const GroupAdminPage = () => {
    const { groupId: id } = useParams();
    const navigate = useNavigate();
    const [groupInfo, setGroupInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGroup = async () => {
            try {
                const data = await fetchGroupDetailById(id);
                console.log("Chi tiết group:", data);
                setGroupInfo(data);
            } catch (error) {
                console.error("❌ Lỗi khi lấy thông tin nhóm:", error.message);
            } finally {
                setLoading(false);
            }
        };

        loadGroup();
    }, [id]);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
                <p className="mt-2">Đang tải thông tin nhóm...</p>
            </div>
        );
    }

    if (!groupInfo) {
        return <p className="text-center text-danger mt-4">Không thể tải dữ liệu nhóm.</p>;
    }

    return (
        <div className="container mt-4">
            {/* Nút quay lại CommunitiesManagement */}
            <Button
                variant="secondary"
                className="mb-3"
                onClick={() => navigate("/admin", { state: { tab: "communities" } })}
            >
                ← Quay lại quản lý cộng đồng
            </Button>

            <h2 className="mb-4 fw-bold text-primary">Quản trị Nhóm</h2>
            <Row>
                <Col md={4}>
                    <Card className="shadow-lg border-0">
                        <Card.Img
                            variant="top"
                            src={groupInfo.avatarUrl || "https://via.placeholder.com/400x200.png?text=No+Avatar"}
                            style={{ height: "220px", objectFit: "cover", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}
                        />
                        <Card.Body>
                            <Card.Title className="fw-semibold fs-5">{groupInfo.name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                {groupInfo.privacyLevel === "private" ? (
                                    <Badge bg="secondary">Riêng tư</Badge>
                                ) : (
                                    <Badge bg="primary">Công khai</Badge>
                                )}
                            </Card.Subtitle>
                            <Card.Text className="mt-3 text-secondary" style={{ minHeight: "80px" }}>
                                {groupInfo.description || "Không có mô tả"}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="shadow-lg border-0 mb-4">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Thông tin chi tiết</h5>
                            <ListGroup variant="flush">
                                <ListGroup.Item><strong>ID nhóm:</strong> {groupInfo.id}</ListGroup.Item>
                                <ListGroup.Item><strong>Ngày tạo:</strong> {new Date(groupInfo.createdAt).toLocaleDateString()}</ListGroup.Item>
                                <ListGroup.Item><strong>Số thành viên:</strong> {groupInfo.totalMembers}</ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Trạng thái:</strong>{" "}
                                    {groupInfo.status === "active" || groupInfo.status === true ? (
                                        <Badge bg="success">Hoạt động</Badge>
                                    ) : (
                                        <Badge bg="danger">Vô hiệu</Badge>
                                    )}
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default GroupAdminPage;
