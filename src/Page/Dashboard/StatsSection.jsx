import React from "react";
import { Row, Col, Card, Skeleton } from "antd";
import "./StatsSection.scss";

const StatsSection = ({ stats }) => {
  const isLoading = !stats || stats.length === 0;

  // Skeleton placeholders
  const skeletonCards = Array.from({ length: 4 }, (_, i) => (
    <Col span={6} key={i}>
      <Card className="stat-card">
        <Skeleton active title paragraph={false} />
      </Card>
    </Col>
  ));

  return (
    <Row gutter={16} className="stats-section">
      {isLoading
        ? skeletonCards
        : stats.map((stat, index) => (
            <Col span={6} key={index}>
              <Card className="stat-card">
                <p className="stat-title">{stat.title}</p>
                <h2 className="stat-value">{stat.value}</h2>
              </Card>
            </Col>
          ))}
    </Row>
  );
};

export default StatsSection;
