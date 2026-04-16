"use client";
import { useState } from "react";

interface IdentifiedObject {
  label: string;
  mask: string;
  score: number;
}

export default function Home() {
  const [theFile, setTheFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<IdentifiedObject[]>([]);
  const [toShow, setToShow] = useState<IdentifiedObject | undefined>(undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  // Make sure we have a file
  const file = event.currentTarget.files?.[0];
  if (!file) return;

  // Update the state variable accordingly
  setTheFile(file);

  // Get the file's data url and set it as the image preview
  const blobUrl = URL.createObjectURL(file);
  setImagePreview(blobUrl);
  };

  const identifyThings = async () => {
  // Make sure we have a file to work with
  if (!theFile) return;

  // Start the loading indicator
  setIsLoading(true);

  // Prepare data to send to our backend
  const formData = new FormData();
  formData.set("theImage", theFile);

  try {
    // Call our backend API - which further calls Hugging Face
    const response = await fetch("/api", {
      method: "POST",
      body: formData,
    });

    // If the API call was successful, set the response
    if (response.ok) {
      console.log("File uploaded successfully");
      const theResponse = await response.json();
      console.log(theResponse);
      setApiResponse(theResponse.body);
    } else {
      console.error("Failed to upload file");
    }
  } catch (error) {
    console.error("Error occurred during API call:", error);
  }

  setIsLoading(false);
};

  return (
    <div>
      Hello there!
    </div>
  )
}