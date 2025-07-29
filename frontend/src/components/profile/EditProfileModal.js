import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Image, Spinner, Nav } from "react-bootstrap";
import { FaCamera, FaTimes, FaLock, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSpring, animated } from "react-spring";
import { XMarkIcon } from "@heroicons/react/24/outline";
import AutocompleteInput from "../location/AutocompleteInput";
import MapView from "../location/MapView";

function EditProfileModal({ show, handleClose, userProfile, onSave, username }) {
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    dateOfBirth: "",
    avatar: "",
    gender: "",
    locationName: "",
    latitude: null,
    longitude: null,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const placeInputRef = useRef(null);

  // Animation cho modal
  const modalAnimation = useSpring({
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0%)" : "translateY(-10%)",
    config: { tension: 220, friction: 20 },
  });

  // Animation cho avatar khi hover
  const avatarAnimation = useSpring({
    scale: formData.avatar ? 1.05 : 1,
    config: { tension: 300, friction: 10 },
  });

  // Animation cho nút lưu khi hover
  const saveButtonAnimation = useSpring({
    scale: loading ? 1 : 1.1,
    config: { tension: 300, friction: 10 },
  });

  useEffect(() => {
    if (show && userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        bio: userProfile.bio || "",
        dateOfBirth: userProfile.dateOfBirth
            ? new Date(userProfile.dateOfBirth).toISOString().split("T")[0]
            : "",
        gender: userProfile.gender != null ? String(userProfile.gender) : "",
        avatar: userProfile.profileImageUrl || "",
        locationName: userProfile.locationName || "",
        latitude: userProfile.latitude || null,
        longitude: userProfile.longitude || null,
      });
      setAvatarFile(null);
      setErrors({});
    }
  }, [show, userProfile]);

  const validateForm = () => {
    const newErrors = {};
    if (formData.displayName.length > 50) {
      newErrors.displayName = "Tên hiển thị không được vượt quá 50 ký tự.";
    }
    if (formData.bio.length > 160) {
      newErrors.bio = "Tiểu sử không được vượt quá 160 ký tự.";
    }
    if (formData.locationName && formData.locationName.length > 255) {
      newErrors.locationName = "Địa điểm không được vượt quá 255 ký tự.";
    }
    if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = "Latitude phải nằm trong khoảng -90 đến 90.";
    }
    if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = "Longitude phải nằm trong khoảng -180 đến 180.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: imageUrl }));
      setAvatarFile(file);
    }
  };

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
    setAvatarFile(null);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const payload = {
        displayName: formData.displayName,
        bio: formData.bio,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender ? Number(formData.gender) : null,
        locationName: formData.locationName || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      };

      // ✅ Log dữ liệu trước khi gửi
      console.log("DEBUG - Username:", username);
      console.log("DEBUG - Payload:", payload);
      console.log("DEBUG - Avatar file:", avatarFile || "No avatar selected");

      const form = new FormData();
      form.append(
          "data",
          new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      if (avatarFile) {
        form.append("avatar", avatarFile);
      }

      // ✅ Log FormData trước khi gửi (chỉ log key vì FormData không in trực tiếp được)
      for (const pair of form.entries()) {
        console.log(`DEBUG - FormData field: ${pair[0]}`, pair[1]);
      }

      console.log("DEBUG - API URL:", `${process.env.REACT_APP_API_URL}/user/profile/${username}`);

      const response = await fetch(
          `${process.env.REACT_APP_API_URL}/user/profile/${username}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: form,
          }
      );

      console.log("DEBUG - Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("DEBUG - API Error response:", errorData);
        throw new Error(errorData.message || "Lỗi khi cập nhật hồ sơ.");
      }

      const updatedProfile = await response.json();
      console.log("DEBUG - Updated profile:", updatedProfile);

      onSave(updatedProfile);
      handleClose();
      toast.success("Hồ sơ đã được cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
      toast.error(`Lỗi khi lưu hồ sơ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteAccount = () => {
    if (
        window.confirm(
            "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!"
        )
    ) {
      alert("Chuyển hướng đến trang xóa tài khoản...");
    }
  };

  const handleSecuritySettings = () => {
    alert("Chuyển hướng đến trang cài đặt bảo mật...");
  };

  const genderOptions = [
    { value: "", label: "Không xác định" },
    { value: "0", label: "Nam" },
    { value: "1", label: "Nữ" },
    { value: "2", label: "Khác" },
  ];

  return (
      <>
        <ToastContainer position="top-center" autoClose={3000} />
        <animated.div style={modalAnimation}>
          <Modal
              show={show}
              onHide={handleClose}
              fullscreen="sm-down"
              centered
              size="lg"
              className="bg-[var(--background-color)] text-[var(--text-color)]"
              dialogClassName="rounded-xl shadow-2xl"
          >
            <Modal.Header className="border-b border-[var(--border-color)] p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Button
                    variant="link"
                    className="text-[var(--text-color)] p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    onClick={handleClose}
                >
                  <FaTimes size={24} />
                </Button>
              </div>
              <Modal.Title className="fw-bold text-xl">Chỉnh sửa hồ sơ</Modal.Title>
              <div className="w-10"></div> {/* Spacer để cân đối */}
            </Modal.Header>

            <Modal.Body className="p-6">
              {/* Avatar Section */}
              <div className="mb-6 text-center">
                <div className="relative inline-block">
                  <animated.div
                      style={avatarAnimation}
                      onMouseEnter={() => formData.avatar && avatarAnimation.scale.set(1.05)}
                      onMouseLeave={() => formData.avatar && avatarAnimation.scale.set(1)}
                  >
                    <Image
                        src={formData.avatar || "https://source.unsplash.com/150x150/?portrait"}
                        roundedCircle
                        className="border-4 border-[var(--border-color)] w-[150px] h-[150px] object-cover transition-transform duration-300"
                    />
                  </animated.div>

                  {/* Upload and Clear Buttons */}
                  <div className="flex justify-center mt-2 space-x-3">
                    <label
                        htmlFor="avatar-upload"
                        className="btn bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
                        style={{ width: "40px", height: "40px" }}
                    >
                      <FaCamera size={16} />
                      <input
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                      />
                    </label>
                    {formData.avatar && (
                        <Button
                            variant="dark"
                            className="rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors duration-200"
                            style={{ width: "40px", height: "40px" }}
                            onClick={handleClearImage}
                        >
                          <XMarkIcon className="h-5 w-5 text-white" />
                        </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <h6 className="fw-bold text-lg mb-4 text-[var(--text-color)]">Thông tin cá nhân</h6>
              <Form className="space-y-4">
                <Form.Group controlId="formDisplayName">
                  <Form.Label className="text-[var(--muted-text-color)] text-sm mb-1">
                    Tên hiển thị
                  </Form.Label>
                  <Form.Control
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange("displayName", e.target.value)}
                      className="border-0 border-b-2 border-[var(--border-color)] rounded-none p-1 bg-transparent text-[var(--text-color)] focus:border-[var(--primary-color)] transition-colors duration-200"
                      isInvalid={!!errors.displayName}
                  />
                  <Form.Control.Feedback type="invalid" className="text-red-500">
                    {errors.displayName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formBio">
                  <Form.Label className="text-[var(--muted-text-color)] text-sm mb-1">
                    Tiểu sử
                  </Form.Label>
                  <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className="border-0 border-b-2 border-[var(--border-color)] rounded-none p-1 bg-transparent text-[var(--text-color)] focus:border-[var(--primary-color)] transition-colors duration-200"
                      isInvalid={!!errors.bio}
                  />
                  <Form.Control.Feedback type="invalid" className="text-red-500">
                    {errors.bio}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formDateOfBirth">
                  <Form.Label className="text-[var(--muted-text-color)] text-sm mb-1">
                    Ngày sinh
                  </Form.Label>
                  <Form.Control
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="border-0 border-b-2 border-[var(--border-color)] rounded-none p-1 bg-transparent text-[var(--text-color)] focus:border-[var(--primary-color)] transition-colors duration-200"
                  />
                </Form.Group>

                <Form.Group controlId="formGender">
                  <Form.Label className="text-[var(--muted-text-color)] text-sm mb-1">
                    Giới tính
                  </Form.Label>
                  <Form.Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="border-0 border-b-2 border-[var(--border-color)] rounded-none p-1 bg-transparent text-[var(--text-color)] focus:border-[var(--primary-color)] transition-colors duration-200"
                  >
                    {genderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="formLocation">
                  <Form.Label className="text-[var(--muted-text-color)] text-sm mb-1">
                    Địa điểm
                  </Form.Label>
                  <AutocompleteInput
                      ref={placeInputRef}
                      onPlaceSelected={(place) => {
                        if (!place) return;
                        setFormData((prev) => ({
                          ...prev,
                          locationName: place.address,
                          latitude: place.lat,
                          longitude: place.lng,
                        }));
                      }}
                  />
                  <Form.Control.Feedback type="invalid" className="text-red-500">
                    {errors.locationName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Form>

              {/* Account Settings */}
              <h6 className="fw-bold text-lg mb-4">Cài đặt tài khoản</h6>
              <div className="space-y-2">
                <button
                    onClick={handleSecuritySettings}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-[var(--text-color-muted)] flex items-center justify-between"
                >
                <span className="flex items-center">
                  <FaLock className="mr-2" /> Cài đặt bảo mật
                </span>
                </button>
                <button
                    onClick={handleDeleteAccount}
                    className="w-full text-left p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 text-danger flex items-center justify-between"
                >
                <span className="flex items-center">
                  <FaTrash className="mr-2" /> Xóa tài khoản
                </span>
                </button>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <animated.div style={saveButtonAnimation}>
                  <Button
                      variant="dark"
                      className="rounded-full px-6 py-2 fw-bold text-white hover:shadow-md transition-all duration-200"
                      onClick={handleSave}
                      disabled={loading}
                  >
                    {loading ? (
                        <>
                          <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                          />
                          Đang lưu...
                        </>
                    ) : (
                        "Lưu"
                    )}
                  </Button>
                </animated.div>
              </div>
            </Modal.Body>
          </Modal>
        </animated.div>
      </>
  );
}

export default EditProfileModal;