"use client";

import { Fragment, useState } from "react";

export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [didMount, setDidMount] = useState(false);

  return (
    <Fragment ref={(fragmentInstance) => setDidMount(!!fragmentInstance)}>
      {didMount ? children : fallback}
    </Fragment>
  );
}
