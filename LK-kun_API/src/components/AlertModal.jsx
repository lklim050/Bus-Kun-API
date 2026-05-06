import React from "react";
import ReactDOM from "react-dom";
import { getLtaAlert } from "../utils/busApi";
import { useQuery } from "@tanstack/react-query";
import AlertCard from "./AlertCard";

const OverLay = (props) => {
  //----------------------- GET LTA Alert------------------------------------
  const ltaAlertQuery = useQuery({
    queryKey: ["alerts"],
    queryFn: () => getLtaAlert(import.meta.env.VITE_ACCKEY),
    enabled: false,
  });

  const ltaAlert = ltaAlertQuery.data?.value ?? [];

  return (
    <div>
      <div className="fixed inset-0 z-40 bg-black/70">
        <div className="fixed inset-0 bg-white overflow-y-auto p-3 sm:p-4 sm:inset-auto sm:top-[8vh] sm:bottom-[8vh] sm:left-1/2 sm:-translate-x-1/2 sm:w-[92%] sm:max-w-4xl sm:rounded-xl">
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
        </div>
        {(ltaAlertQuery.isSuccess || ltaAlertQuery.data) &&
          (ltaAlert && ltaAlert.length > 0 ? (
            <div>
              <AlertCard
                key={ltaAlert.id}
                id={ltaAlert.id}
                alert={ltaAlert}
                status={ltaAlert.Status}
                affected={ltaAlert.AffectedSegments}
                message={ltaAlert.Message}
              />
            </div>
          ) : (
            <p className="text-gray-600 text-sm sm:text-base">
              No alert messages from LTA yet
            </p>
          ))}
      </div>
    </div>
  );
};

const AlertModal = (props) => {
  return (
    <div>
      {""}
      {ReactDOM.createPortal(
        <OverLay setAlertModal={props.setAlertModal} />,
        document.querySelector("#modal-root"),
      )}
    </div>
  );
};

export default AlertModal;
