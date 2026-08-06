# Settlement Architecture\n\n`mermaid\nsequenceDiagram\nSender->>Outbox: Enqueue Transfer\nOutbox->>Stellar: Execute Bridge\nStellar->>MNO: Deliver KES/RWF\n`
