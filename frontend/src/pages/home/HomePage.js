import React, { useState, useEffect, useContext, useRef } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SidebarRight from "../../components/layout/SidebarRight/SidebarRight";
import TweetInput from "../../components/posts/TweetInput/TweetInput";
import TweetCard from "../../components/posts/TweetCard/TweetCard";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function HomePage({ onShowCreatePost, onToggleDarkMode }) {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const postRefs = useRef({});

  const postId = searchParams.get("postId");

  const fetchPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/newsfeed`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch posts!");
      }
      const { message, data } = await response.json();
      if (Array.isArray(data)) {
        setPosts(data);
        toast.success(message || "Lấy newsfeed thành công");
      } else {
        setPosts([]);
        setError("Invalid data format from API");
        toast.error("Dữ liệu không đúng định dạng");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  useEffect(() => {
    if (postId && postRefs.current[postId]) {
      postRefs.current[postId].scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 1000);
    }
  }, [postId, posts, setSearchParams]);

  const handlePostSuccess = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
      <motion.div
          className="d-flex flex-column min-vh-100 bg-[var(--background-color)]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
      >
        <Container fluid className="flex-grow-1">
          <Row className="h-100">
            <Col xs={12} lg={8} className="p-0">
              <motion.div
                  className="sticky top-0 z-[1020] bg-[var(--background-color)] text-[var(--text-color)] font-bold text-lg px-3 py-2 border-b shadow-sm flex justify-between items-center"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
              >
                <span>Trang chủ</span>
              </motion.div>
              <motion.div variants={itemVariants}>
                <TweetInput postOnSuccess={handlePostSuccess} />
              </motion.div>
              <AnimatePresence>
                {loading ? (
                    <motion.div
                        className="d-flex justify-content-center py-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                      <Spinner animation="border" role="status" style={{ color: "var(--text-color)" }} />
                    </motion.div>
                ) : error ? (
                    <motion.p
                        className="text-danger text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                      {error}
                    </motion.p>
                ) : posts.length > 0 ? (
                    posts.map((tweet, index) => (
                        <motion.div
                            key={tweet.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                          <TweetCard
                              tweet={tweet}
                              onPostUpdate={fetchPosts}
                              ref={(el) => (postRefs.current[tweet.id] = el)}
                          />
                        </motion.div>
                    ))
                ) : (
                    <motion.p
                        className="text-center p-4 text-[var(--text-color)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                      No posts found.
                    </motion.p>
                )}
              </AnimatePresence>
            </Col>
            <Col xs={0} lg={4} className="d-none d-lg-block border-start p-0">
              <motion.div variants={itemVariants}>
                <SidebarRight />
              </motion.div>
            </Col>
          </Row>
        </Container>
      </motion.div>
  );
}

export default HomePage;