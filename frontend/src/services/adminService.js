// Admin Service - Quản lý các API calls cho admin

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Lấy token từ localStorage hoặc sessionStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('=== TOKEN DEBUG ===');
  console.log('Token exists:', !!token);
  console.log('Token length:', token ? token.length : 0);
  console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');
  
  // Kiểm tra token có hợp lệ không
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      console.log('Token payload:', payload);
      console.log('Token expires at:', new Date(payload.exp * 1000));
      console.log('Current time:', new Date());
      console.log('Token expired:', payload.exp < currentTime);
      
      if (payload.exp < currentTime) {
        console.warn('Token has expired!');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return null;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
  
  return token;
};

// Tạo headers cho API request
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Xử lý response từ API
const handleResponse = async (response) => {
  console.log('=== API RESPONSE DEBUG ===');
  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);
  console.log('Response url:', response.url);
  console.log('Response type:', response.type);
  console.log('Response redirected:', response.redirected);
  
  if (!response.ok) {
    let errorData = {};
    let errorText = '';
    
    try {
      // Thử parse JSON trước
      const text = await response.text();
      errorText = text;
      
      console.log('=== ERROR RESPONSE DETAILS ===');
      console.log('Raw error text:', text);
      console.log('Text length:', text.length);
      
      if (text) {
        try {
          errorData = JSON.parse(text);
          console.log('Parsed error data:', errorData);
        } catch (jsonError) {
          console.log('JSON parse failed:', jsonError.message);
          // Nếu không parse được JSON, sử dụng text
          errorData = { message: text };
        }
      }
      
      console.log('Final error data:', errorData);
      console.log('Final error text:', errorText);
    } catch (parseError) {
      console.log('Failed to parse error response:', parseError);
      errorData = { message: `HTTP ${response.status} Error` };
    }
    
    // Tạo error message chi tiết hơn
    let errorMessage;
    if (response.status === 403) {
      errorMessage = 'Phiên đăng nhập đã hết hạn hoặc bạn không có quyền thực hiện hành động này.';
    } else if (response.status === 401) {
      errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    } else if (response.status === 404) {
      errorMessage = 'Không tìm thấy tài nguyên yêu cầu.';
    } else if (response.status === 500) {
      errorMessage = 'Lỗi server nội bộ. Vui lòng thử lại sau.';
    } else {
      errorMessage = errorData.message || errorText || `HTTP error! status: ${response.status}`;
    }
    
    console.log('Final error message:', errorMessage);
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.response = {
      status: response.status,
      data: errorData,
      headers: response.headers
    };
    throw error;
  }
  
  try {
    const data = await response.json();
    console.log('Success response data:', data);
    return data;
  } catch (parseError) {
    console.log('Success but failed to parse JSON:', parseError);
    return { success: true, message: 'Operation completed successfully' };
  }
};

// Test function để debug API endpoint
const testUpdateUserLockStatus = async () => {
  console.log('=== TESTING UPDATE USER LOCK STATUS ===');
  try {
    const result = await adminService.updateUserLockStatus(1, true);
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Direct test function để bypass adminService wrapper
const directTestUpdateUserLockStatus = async (userId = 1, isLocked = true) => {
  console.log('=== DIRECT TEST UPDATE USER LOCK STATUS ===');
  
  const token = getAuthToken();
  if (!token) {
    console.error('No token found!');
    return;
  }
  
  const url = `${API_BASE_URL}/admin/users/${userId}/lock?isLocked=${isLocked}`;
  const headers = getHeaders();
  
  console.log('Direct test - URL:', url);
  console.log('Direct test - Headers:', headers);
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: headers,
    });
    
    console.log('Direct test - Response status:', response.status);
    console.log('Direct test - Response ok:', response.ok);
    console.log('Direct test - Response statusText:', response.statusText);
    
    // Try to read response text
    const responseText = await response.text();
    console.log('Direct test - Response text:', responseText);
    console.log('Direct test - Response text length:', responseText.length);
    
    if (responseText) {
      try {
        const responseJson = JSON.parse(responseText);
        console.log('Direct test - Response JSON:', responseJson);
      } catch (jsonError) {
        console.log('Direct test - Failed to parse JSON:', jsonError.message);
      }
    }
    
  } catch (error) {
    console.error('Direct test - Fetch error:', error);
  }
};

// Test function để kiểm tra token và connectivity
const testTokenAndConnectivity = async () => {
  console.log('=== TESTING TOKEN AND CONNECTIVITY ===');
  
  // Kiểm tra token
  const token = getAuthToken();
  console.log('Token check result:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
  });
  
  if (!token) {
    console.error('No valid token found!');
    return;
  }
  
  // Test simple API call
  try {
    console.log('Testing API connectivity...');
    const response = await fetch(`${API_BASE_URL}/admin/users?page=0&size=1`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    console.log('API test response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    if (response.ok) {
      console.log('✅ API connectivity test passed!');
    } else {
      console.log('❌ API connectivity test failed!');
    }
  } catch (error) {
    console.error('❌ API connectivity test error:', error);
  }
};

// Expose test functions to window for manual testing
if (typeof window !== 'undefined') {
  window.testUpdateUserLockStatus = testUpdateUserLockStatus;
  window.directTestUpdateUserLockStatus = directTestUpdateUserLockStatus;
  window.testTokenAndConnectivity = testTokenAndConnectivity;
}

export const adminService = {
  // === QUẢN LÝ NGƯỜI DÙNG ===
  
  // Lấy danh sách người dùng
  async getUsers(page = 0, size = 10, search = '') {
    const url = new URL(`${API_BASE_URL}/admin/users`);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    if (search) {
      url.searchParams.append('search', search);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    return await handleResponse(response);
  },

  // Lấy thông tin chi tiết một người dùng
  async getUserById(userId) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return await handleResponse(response);
  },

  // Cập nhật thông tin người dùng
  async updateUser(userId, userUpdate) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userUpdate),
    });

    return await handleResponse(response);
  },



  // Cập nhật trạng thái khóa người dùng (is_locked field)
  async updateUserLockStatus(userId, isLocked) {
    // Kiểm tra token trước khi gọi API
    const token = getAuthToken();
    if (!token) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    const url = `${API_BASE_URL}/admin/users/${userId}/lock?isLocked=${isLocked}`;
    const headers = getHeaders();
    
    console.log('=== UPDATE USER LOCK STATUS DEBUG ===');
    console.log('URL:', url);
    console.log('Method: PATCH');
    console.log('Headers:', headers);
    console.log('User ID:', userId);
    console.log('Is Locked:', isLocked);
    console.log('API_BASE_URL:', API_BASE_URL);
    
    try {
      console.log('=== SENDING REQUEST ===');
      const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
      });
      
      console.log('=== RESPONSE RECEIVED ===');
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Xử lý đặc biệt cho lỗi 403 (token hết hạn)
      if (response.status === 403) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      console.log('=== CALLING HANDLE RESPONSE ===');
      console.log('About to call handleResponse with response:', {
        status: response.status,
        ok: response.ok,
        url: response.url
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('=== FETCH ERROR ===');
      console.error('Error in updateUserLockStatus:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      // Nếu là network error, cung cấp thông báo rõ ràng hơn
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }
      
      throw error;
    }
  },



  // Gửi thông báo cho người dùng
  async sendNotification(userId, message, type = 'ADMIN_MESSAGE') {
    const response = await fetch(`${API_BASE_URL}/admin/users/send-notification`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        userId,
        message,
        type,
      }),
    });

    return await handleResponse(response);
  },

  // === QUẢN LÝ BÁO CÁO ===
  
  // Lấy danh sách báo cáo
  async getReports(page = 0, size = 10, status = '') {
    const url = new URL(`${API_BASE_URL}/admin/list`);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    if (status) {
      url.searchParams.append('processingStatusId', status);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    return await handleResponse(response);
  },

  // Lấy chi tiết một báo cáo
  async getReportById(reportId) {
    const response = await fetch(`${API_BASE_URL}/admin/${reportId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return await handleResponse(response);
  },

  // Cập nhật trạng thái báo cáo
  async updateReportStatus(reportId, status, adminNote = '') {
    const response = await fetch(`${API_BASE_URL}/admin/${reportId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        processingStatusId: status,
        adminNote
      }),
    });

    return await handleResponse(response);
  },

  // Xóa báo cáo (dismiss)
  async deleteReport(reportId) {
    const response = await fetch(`${API_BASE_URL}/admin/${reportId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return await handleResponse(response);
  },

  // === CÁC TÍNH NĂNG ADMIN KHÁC CÓ THỂ ĐƯỢC THÊM VÀO ĐÂY ===
  
  // Lấy thống kê tổng quan
  async getDashboardStats() {
    // Placeholder cho API thống kê
    // const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    //   method: 'GET',
    //   headers: getHeaders(),
    // });
    // return await handleResponse(response);
    
    // Trả về dữ liệu giả cho đến khi API được implement
    return {
      data: {
        totalUsers: 0,
        activeUsers: 0,
        totalPosts: 0,
        totalReports: 0,
      }
    };
  },
};

export default adminService;