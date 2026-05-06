import React from "react";
import ReactDOM from "react-dom";
import { getLtaAlert } from "../utils/busApi";
import { useQuery } from "@tanstack/react-query";
import AlertCard from "./AlertCard";

const OverLay = (props) => {
  //----------------------- GET LTA Alert------------------------------------
  const ltaAlertQuery = useQuery({
    queryKey: ["alerts"],
    queryFn: getLtaAlert,
    enabled: true,
    staleTime: 300_000,
  });

  // not this is an object JSON
  const ltaAlert = ltaAlertQuery.data?.value ?? null;

  if (ltaAlert.Status === 2) {
    props.setAlertStatus(2);
  }

  const sampleStatus2 = {
    Status: 2,
    AffectedSegments: [],
    Message: [
      {
        Content:
          "09:58-Due to heavy traffic entering Woodlands Checkpoint, bus services 170 and 170X are diverted from Woodlands Road to ply along Woodlands Avenue 3 and Woodlands Centre Road, in the Woodlands Checkpoint direction.",
        CreatedDate: "2026-05-06 10:03:43",
      },
      {
        Content:
          "05:00-SK-Planned Service Adjustment. From 19 Apr to 18 Oct 2026, the Sengkang West LRT Inner Loop (i.e. direction of STC Sengkang towards SW1 Cheng Lim) will be closed. Commuters can continue to use the Sengkang West LRT Outer Loop (i.e. direction of STC Sengkang towards SW8 Renjong), peak-hours shuttle bus services, or regular bus services.",
        CreatedDate: "2026-04-18 11:50:27",
      },
      {
        Content:
          "05:00-CCL-Planned Service Adjustment. From 11 Apr to 17 May 2026, Circle Line train services will end earlier at 11.00pm on Saturday nights and commence later at 9.00am on Sunday mornings. Please use alternative MRT lines and bus services.",
        CreatedDate: "2026-04-10 00:15:58",
      },
    ],
  };

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
