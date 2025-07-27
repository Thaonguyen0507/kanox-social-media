import React, { useContext, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";


const PremiumPage = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(null); // 'MONTHLY', 'SEMI_ANNUALLY', 'ANNUALLY'
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const plans = [
    {
      id: "MONTHLY",
      name: "Gói 1 Tháng",
      price: "10.000đ",
      duration: "trải nghiệm",
    },
    {
      id: "SEMI_ANNUALLY",
      name: "Gói 6 Tháng",
      price: "50.000đ",
      duration: "tiết kiệm",
    },
    {
      id: "ANNUALLY",
      name: "Gói 1 Năm",
      price: "100.000đ",
      duration: "tối ưu",
    },
  ];

  const handleSubscription = async (planId) => {
    if (!user) {
      setError("Bạn cần đăng nhập để thực hiện chức năng này.");
      return;
    }

    setLoading(planId);
    setError("");
    setSuccess("");
    const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

    const returnUrl = "https://kanox-social-media.netlify.app/home";
    const cancelUrl = "https://kanox-social-media.netlify.app/home"
    const response = await fetch(
        `${process.env.REACT_APP_API_URL}/payment/premium/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // đảm bảo token đã được định nghĩa trước đó
          },
          body: JSON.stringify({
            amount: "2000",
            description: "Kanox prenium",
            returnUrl: returnUrl,
            cancelUrl: cancelUrl
          }),
        }
    );

    if (response.ok) {
      const data = await response.json();
      const checkoutUrl = data.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl; // Redirect user đến trang thanh toán
      } else {
        console.error("Không tìm thấy link thanh toán trong phản hồi.");
      }
    } else {
      console.error("Lỗi khi gọi API:", response.status);
    }
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    const orderCode = searchParams.get("orderCode");
    const transactionId = searchParams.get("id");
    const cancel = searchParams.get("cancel");

    if (status === "PAID" && cancel === "false") {
      // Gọi API xác nhận và insert dữ liệu
      confirmPremium(orderCode, transactionId);
    }
  }, []);

  const confirmPremium = async (orderCode, transactionId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/payment/premium/confirm`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderCode,
              transactionId,
            }),
          }
      );

      if (true) {
        alert("🎉 Bạn đã đăng ký premium thành công!");
        // Có thể cập nhật lại UI ở đây nếu cần
      } else {
        alert("❌ Xác nhận thất bại. Vui lòng liên hệ hỗ trợ.");
      }
    } catch (error) {
      console.error("Lỗi xác nhận premium:", error);
    }
  };


  return (
    <Container className="mt-4">
      <div className="text-center mb-5">
        <h1 className="text-[var(--text-color)]">Nâng cấp tài khoản Premium</h1>
        <p className="lead text-[var(--text-color-muted)]">
          Trải nghiệm các tính năng độc quyền và hỗ trợ đội ngũ phát triển.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        {plans.map((plan) => (
          <Col md={4} key={plan.id} className="mb-4">
            <Card className="text-center h-100 bg-[var(--background-color-secondary)] border-[var(--border-color)]">
              <Card.Header as="h5" className="text-[var(--text-color)]">
                {plan.name}
              </Card.Header>
              <Card.Body>
                <Card.Title className="display-4 text-[var(--text-color)]">
                  {plan.price}
                </Card.Title>
                <Card.Text className="text-[var(--text-color-muted)]">
                  Gói {plan.duration} dành cho bạn.
                </Card.Text>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleSubscription(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{" "}
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng ký ngay"
                  )}
                </Button>
              </Card.Body>
              <Card.Footer className="text-muted">
                Thanh toán một lần
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PremiumPage;
