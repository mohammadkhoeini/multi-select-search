import React, { useEffect, useState } from "react";

type FetchParams = {
  url: string;
  params?: object;
};

export const useFetch = ({ url, params }: FetchParams) => {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setIsPending(true);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(response.statusText);
        } else {
          const json = await response.json();
          setIsPending(false);
          setData(json);
          setError("");
        }
      } catch (error: any) {
        setError(`${error} Could not Fetch Data `);
        setIsPending(false);
      }
    };
    fetchData();
  }, [url]);
  return { data, isPending, error };
};
