import React from "react";
import { Row, Col, Image as BootstrapImage } from "react-bootstrap";

const PostImages = ({ images, onClickImage }) => {
    if (!Array.isArray(images) || images.length === 0) return null;

    const imageCount = images.length;

    const handleClick = (url, idx) => {
        if (onClickImage) onClickImage(url, idx);
    };

    if (imageCount === 1) {
        return (
            <div className="overflow-hidden rounded-2xl mb-2 d-flex justify-content-center">
                <BootstrapImage
                    src={images[0]}
                    className="rounded-2xl cursor-pointer"
                    style={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "auto",
                        maxHeight: "400px",
                        objectFit: "cover",
                    }}
                    fluid
                    onClick={() => handleClick(images[0], 0)}
                />
            </div>
        );
    }

    if (imageCount === 2) {
        return (
            <Row className="overflow-hidden rounded-2xl g-2 mb-2">
                {images.map((url, idx) => (
                    <Col key={idx} xs={6}>
                        <BootstrapImage
                            src={url}
                            className="w-full h-[300px] object-cover rounded-2xl cursor-pointer"
                            fluid
                            onClick={() => handleClick(url, idx)}
                        />
                    </Col>
                ))}
            </Row>
        );
    }

    if (imageCount === 3) {
        return (
            <Row className="overflow-hidden rounded-2xl g-2 mb-2">
                <Col xs={6}>
                    <BootstrapImage
                        src={images[0]}
                        className="w-full h-[400px] object-cover rounded-2xl cursor-pointer"
                        fluid
                        onClick={() => handleClick(images[0], 0)}
                    />
                </Col>
                <Col xs={6}>
                    <div className="flex flex-col h-full g-1">
                        <BootstrapImage
                            src={images[1]}
                            className="w-full h-[198px] object-cover rounded-2xl mb-1 cursor-pointer"
                            fluid
                            onClick={() => handleClick(images[1], 1)}
                        />
                        <BootstrapImage
                            src={images[2]}
                            className="w-full h-[198px] object-cover rounded-2xl cursor-pointer"
                            fluid
                            onClick={() => handleClick(images[2], 2)}
                        />
                    </div>
                </Col>
            </Row>
        );
    }

    return (
        <Row className="overflow-hidden rounded-2xl g-2 mb-2">
            {images.slice(0, 4).map((url, idx) => (
                <Col key={idx} xs={6}>
                    <div className="relative">
                        <BootstrapImage
                            src={url}
                            className="w-full h-[200px] object-cover rounded-2xl cursor-pointer"
                            fluid
                            onClick={() => idx < 4 && handleClick(url, idx)}
                        />
                        {idx === 3 && images.length > 4 && (
                            <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center text-white text-2xl font-bold rounded-2xl pointer-events-none">
                                +{images.length - 4}
                            </div>
                        )}
                    </div>
                </Col>
            ))}
        </Row>
    );
};

export default PostImages;
