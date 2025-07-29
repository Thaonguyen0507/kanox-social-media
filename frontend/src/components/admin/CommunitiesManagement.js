// src/pages/admin/CommunitiesManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { fetchAllGroups } from "../../api/groupApi";
import { useNavigate } from "react-router-dom";

const CommunitiesManagement = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadCommunities = async () => {
    try {
      const data = await fetchAllGroups();
      setCommunities(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const handleView = (id) => {
    navigate(`/admin/groups/${id}/view`);
  };

  const handleManageMembers = (id) => {
    navigate(`/admin/groups/${id}/members`);
  };

  if (loading)
    return (
        <div className="d-flex flex-column align-items-center mt-5">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Đang tải danh sách cộng đồng...</p>
        </div>
    );

  if (error)
    return (
        <Alert variant="danger" className="text-center mt-4">
          {error}
        </Alert>
    );

  return (
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Header className="bg-white border-bottom">
                <h3 className="mb-0 text-primary fw-bold">Quản lý Cộng đồng</h3>
              </Card.Header>
              <Card.Body className="p-3">
                <Table hover responsive bordered className="align-middle">
                  <thead className="table-light">
                  <tr>
                    <th>Tên cộng đồng</th>
                    <th>Thành viên</th>
                    <th>Trạng thái</th>
                    <th>Loại</th>
                    <th>Ngày tạo</th>
                    <th className="text-center">Hành động</th>
                  </tr>
                  </thead>
                  <tbody>
                  {communities.map((community) => (
                      <tr key={community.id}>
                        <td className="fw-semibold">{community.name}</td>
                        <td>{community.members}</td>
                        <td>
                          <Badge
                              pill
                              bg={
                                community.status === "active" ? "success" : "danger"
                              }
                          >
                            {community.status === "active"
                                ? "Hoạt động"
                                : "Vô hiệu"}
                          </Badge>
                        </td>
                        <td>
                          <Badge
                              pill
                              bg={
                                community.type === "public"
                                    ? "primary"
                                    : "secondary"
                              }
                          >
                            {community.type === "public"
                                ? "Công khai"
                                : "Riêng tư"}
                          </Badge>
                        </td>
                        <td>
                          {new Date(community.created).toLocaleDateString()}
                        </td>
                        <td className="text-center">
                          <Button
                              variant="outline-primary"
                              size="sm"
                              className="rounded-pill px-3"
                              onClick={() => handleView(community.id)}
                          >
                            Xem
                          </Button>
                          <Button
                              variant="outline-info"
                              size="sm"
                              className="ms-2 rounded-pill px-3"
                              onClick={() => handleManageMembers(community.id)}
                          >
                            Thành viên
                          </Button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
  );
};

export default CommunitiesManagement;
