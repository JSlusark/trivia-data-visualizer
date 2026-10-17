import { useEffect, useState } from "react";
import type { TriviaQuestion } from "../types";
import axios from "axios";

/*
TODO:
- add local storage caching to reduce API calls and to use when offline
- integration tests with jest to check on API response handling
- 50 is the num of maximum questions per API call, so  could handle a case where i load more
- loading smaller data would be useful when amount in a very high number (1000+)
*/
export const useTriviaData = (amount: number) => {
    const [data, setData] = useState<TriviaQuestion[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            axios
                .get(`https://opentdb.com/api.php?amount=${amount}&encode=url3986`)
                .then((res) => {
                    // console.log(res);
                    // console.log(res.data.results);
                    const decoded = res.data.results.map((q: TriviaQuestion) => ({
                        ...q,
                        category: decodeURIComponent(q.category),
                        question: decodeURIComponent(q.question),
                        correct_answer: decodeURIComponent(q.correct_answer),
                        incorrect_answers: q.incorrect_answers.map((a: string) =>
                            decodeURIComponent(a)
                        ),
                    }));

                    setData(decoded);
                    setIsLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setIsLoading(false);
                });
        }, 5000);

        return () => clearTimeout(timer);
    }, [amount]);

    return { data, isLoading, error };
};
