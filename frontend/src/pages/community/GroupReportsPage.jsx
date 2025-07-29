import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Button, ListGroup, Modal, Form, Card } from "react-bootstrap";
import { toast } from "react-toastify";

const GroupReportsPage = () => {
    const { groupId } = useParams();
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // Lấy danh sách báo cáo
    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/reports/group/${groupId}?status=true&page=0&size=20`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Không thể lấy danh sách báo cáo.");
            }
            const data = await res.json();
            setReports(data.content || []);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách báo cáo:", err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật trạng thái báo cáo
    const handleUpdateReportStatus = async (reportId, statusId) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/${reportId}/status`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ processingStatusId: statusId }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Không thể cập nhật trạng thái báo cáo.");
            }
            toast.success(statusId === 3 ? "Đã duyệt báo cáo!" : "Đã từ chối báo cáo!");
            setShowUpdateModal(false);
            fetchReports(); // Cập nhật lại danh sách
        } catch (err) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        if (!groupId || !token) return;
        fetchReports();
    }, [groupId, token]);

    // Modal xác nhận cập nhật trạng thái
    const UpdateReportModal = ({ show, onHide, report }) => {
        return (
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xử lý báo cáo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Bạn muốn <strong>{report?.processingStatusId === 3 ? "duyệt" : "từ chối"}</strong> báo cáo này?
                    </p>
                    {report && (
                        <Card>
                            <Card.Body>
                                <Card.Text>
                                    <strong>Bài viết:</strong> {report.content || "Không có nội dung"}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Lý do báo cáo:</strong> {report.reason?.name || "Không xác định"}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Người báo cáo:</strong> @{report.reporterUsername}
                                </Card.Text>
                                {report.imageUrls?.length > 0 && (
                                    <div>
                                        <strong>Hình ảnh:</strong>
                                        {report.imageUrls.map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt="Reported content"
                                                style={{ maxWidth: "100px", margin: "5px" }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Đóng
                    </Button>
                    <Button
                        variant={report?.processingStatusId === 3 ? "success" : "danger"}
                        onClick={() => handleUpdateReportStatus(report.id, report.processingStatusId)}
                    >
                        {report?.processingStatusId === 3 ? "Duyệt" : "Từ chối"}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };

    if (loading) return <div className="text-center py-4">Đang tải...</div>;

    return (
        <div className="container py-4">
            <h2 className="mb-4">Báo cáo trong nhóm</h2>
            {reports.length > 0 ? (
                <ListGroup>
                    {reports.map((report) => (
                        <ListGroup.Item
                            key={report.id}
                            className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                        >
                            <div>
                                <p>
                                    <strong>Bài viết:</strong> {report.content || "Không có nội dung"}
                                </p>
                                <p>
                                    <strong>Lý do:</strong> {report.reason?.name || "Không xác định"}
                                </p>
                                <p>
                                    <strong>Người báo cáo:</strong> @{report.reporterUsername}
                                </p>
                                <p>
                                    <strong>Trạng thái:</strong> {report.processingStatusName || "Chưa xử lý"}
                                </p>
                                {report.imageUrls?.length > 0 && (
                                    <div>
                                        {report.imageUrls.map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt="Reported content"
                                                style={{ maxWidth: "100px", margin: "5px" }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedReport({ ...report, processingStatusId: 3 });
                                        setShowUpdateModal(true);
                                    }}
                                    disabled={report.processingStatusId === 3 || report.processingStatusId === 4}
                                >
                                    Duyệt
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedReport({ ...report, processingStatusId: 4 });
                                        setShowUpdateModal(true);
                                    }}
                                    disabled={report.processingStatusId === 3 || report.processingStatusId === 4}
                                >
                                    Từ chối
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <p>Không có báo cáo nào trong nhóm này.</p>
            )}
            <Button variant="secondary" className="mt-3" onClick={() => navigate(`/groups/${groupId}`)}>
                Quay lại nhóm
            </Button>
            <UpdateReportModal
                show={showUpdateModal}
                onHide={() => setShowUpdateModal(false)}
                report={selectedReport}
            />
        </div>
    );
};

export default GroupReportsPage;