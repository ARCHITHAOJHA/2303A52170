import axios from "axios";

const BASE_URL =
  "http://4.224.186.213/evaluation-service/notifications";

const TOKEN = "bDreAq";


export const fetchNotifications = async () => {
  return [
    {
      id: 1,
      message: "Semester Results Released",
      type: "Result"
    },
    {
      id: 2,
      message: "New Internship Opportunity",
      type: "Job"
    },
    {
      id: 3,
      message: "Scholarship Applications Open",
      type: "Scholarship"
    }
  ];
};