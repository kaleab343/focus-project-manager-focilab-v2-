import React from "react";
import { Space } from "@refinedev/antd";
import { useDrop } from "react-dnd";
import { cardType } from "./constants/enums";

interface ColumnProps {
  children: React.ReactNode;
  name: string;
}

function Column({ children, name }: ColumnProps) {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: cardType.ORDER,
    drop: () => ({
      name,
    }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <Space direction="vertical" style={{ width: "270px" }}>
      <div
        style={{
          backgroundColor: "#e3e7ee",
          padding: "15px",
          minHeight: "170px",
          maxHeight: "690px",
          borderRadius: "5px",
          overflowY: "scroll",
        }}
      >
        <div
          style={{
            fontSize: "17px",
            marginLeft: "10px",
            marginBottom: "15px",
            color: "#84878c",
          }}
        >
          {name}
        </div>
        {drop(
          <div
            style={{
              width: "100%",
              height: "75%",
              padding: "4px",
              border: isOver ? "dashed 1px black" : "",
            }}
          >
            {children}
          </div>
        )}
      </div>
    </Space>
  );
}
