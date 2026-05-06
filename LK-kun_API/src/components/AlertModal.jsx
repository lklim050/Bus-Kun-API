import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { getLtaAlert } from "../utils/busApi";
import { useQuery } from "@tanstack/react-query";
import AlertCard from "./AlertCard";
import { sampleStatus2 } from "../utils/busApi";

const OverLay = (props) => {
  //----------------------- GET LTA Alert------------------------------------
  const ltaAlertQuery = useQuery({
    queryKey: ["alerts"],
    queryFn: getLtaAlert,
    enabled: true,
    staleTime: 300_000,
  });

  // not this is an object JSON
  //   const ltaAlert = ltaAlertQuery.data?.value ?? null;

  // load sample data to alert modal (for demo)
  const ltaAlert = sampleStatus2;

  // Avoid side-effects during render: update parent status in effect
  useEffect(() => {
    if (!ltaAlert) return;
    if (ltaAlert.Status === 2) {
      props.setAlertStatus(2);
    } else if (ltaAlert.Status === 3) {
      props.setAlertStatus(3);
    } else {
      props.setAlertStatus(1);
    }
  }, [ltaAlert, props]);

  return (
    <div>
      <div className="fixed inset-0 z-40 bg-black/70">
        <div
          className="fixed inset-0 bg-white overflow-y-auto p-3 sm:p-4 
                sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 
                sm:w-[92%] sm:max-w-4xl sm:max-h-[80vh] sm:rounded-xl"
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              ALERT ALERT!!!
            </h1>
            <button
              onClick={() => {
                props.setAlertModal(false);
              }}
              className="px-3 py-2 bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400 text-sm"
            >
              Close
            </button>
          </div>

          {ltaAlertQuery.isLoading && (
            <p className="text-sm text-gray-700">Loading alerts...</p>
          )}

          {ltaAlertQuery.isError && (
            <p className="text-sm text-red-600">
              Failed to load alerts. Please try again.
            </p>
          )}

          {ltaAlertQuery.isSuccess && ltaAlert && (
            <div className="list-none p-0 m-0 flex flex-wrap gap-3">
              <AlertCard
                status={ltaAlert.Status}
                affected={ltaAlert.AffectedSegments}
                message={ltaAlert.Message}
              />
            </div>
          )}

          {ltaAlertQuery.isSuccess && !ltaAlert && (
            <p className="text-sm text-gray-700">No active alerts.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AlertModal = (props) => {
  return (
    <div>
      {ReactDOM.createPortal(
        <OverLay
          setAlertModal={props.setAlertModal}
          setAlertStatus={props.setAlertStatus}
        />,
        document.querySelector("#modal-root"),
      )}
    </div>
  );
};

export default AlertModal;
