import React from "react";
import ReactDOM from "react-dom";
import AlertCard from "./AlertCard";

const OverLay = (props) => {
  return (
    <div>
      <div className="fixed inset-0 z-40 bg-black/70">
        <div
          className="fixed inset-0 bg-white overflow-y-auto p-3 sm:p-4 
                sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 
                sm:w-[92%] sm:max-w-4xl sm:max-h-[80vh] sm:rounded-xl"
        >
          <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:items-center mb-3">
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

          {props.message && props.message.length > 0 ? (
            <div className="list-none p-0 m-0 flex flex-wrap gap-3">
              <AlertCard
                status={props.status}
                affected={props.affected}
                message={props.message}
              />
            </div>
          ) : (
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
          status={props.status}
          affected={props.affected}
          message={props.message}
        />,
        document.querySelector("#modal-root"),
      )}
    </div>
  );
};

export default AlertModal;
