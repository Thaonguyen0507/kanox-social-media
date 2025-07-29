import React, { useState, useEffect } from "react";
import { Container, Row, Col, Tab, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommunitiesManagement from "../../components/admin/CommunitiesManagement";
import DashboardOverview from "../../components/admin/DashboardOverview";
import ReportsManagement from "../../components/admin/ReportsManagement";
import Settings from "../../components/admin/Settings";
import Sidebar from "../../components/admin/Sidebar";
import PostsManagement from "../../components/admin/PostsManagement";
import UsersManagement from "../../components/admin/UsersManagement";
import { useLocation } from "react-router-dom";

const AdminDashboardApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const location = useLocation();
  const newReport = location.state?.newReport;

  useEffect(() => {
    if (newReport) {
      toast.info(
          `Báo cáo mới từ ${newReport.reporterUsername}: ${newReport.reason}`
      );
      setActiveTab("reports");
    }
  }, [newReport]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UsersManagement />;
      case "posts":
        return <PostsManagement />;
      case "communities":
        return <CommunitiesManagement />;
      case "reports":
        return <ReportsManagement />;
      case "settings":
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
      <div className="min-vh-100 d-flex flex-column bg-light">
        {/* Header */}
        <Navbar bg="white" className="shadow-sm px-4" fixed="top">
          <Navbar.Brand className="fw-bold text-primary">
            KaNox Admin Dashboard
          </Navbar.Brand>
        </Navbar>

        {/* Content */}
        <Container fluid className="flex-grow-1 mt-5 pt-4">
          <Row>
            {/* Sidebar */}
            <Col md={3} lg={2} className="mb-4">
              <div className="bg-white rounded shadow-sm h-100 p-3">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            </Col>

            {/* Main content */}
            <Col md={9} lg={10}>
              <div className="bg-white rounded shadow-sm p-4">
                <Tab.Container
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                >
                  <Tab.Content>{renderContent()}</Tab.Content>
                </Tab.Container>
              </div>
            </Col>
          </Row>
        </Container>

        <footer className="text-center py-3 bg-white border-top mt-auto">
          <small className="text-muted">
            Quản lý hệ thống mạng xã hội KaNox.
          </small>
        </footer>

        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
      </div>
  );
};

export default AdminDashboardApp;
