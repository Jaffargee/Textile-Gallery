import DBWithCache from "@/lib/cache-db";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DBContext = createContext<{ db: DBWithCache; ready: boolean } | null>(null);

export default function DBContextProvider({ children }: { children: React.ReactNode }) {

      const [ready, setReady] = useState(false);
      const dbWithCache = useMemo(() => DBWithCache.getInstance(), []);

      
      useEffect(() => {

            (async () => {
                  await dbWithCache.dbConnect();
                  setReady(true);
            })();

      }, [dbWithCache]);

      return (
            <DBContext.Provider value={{ db: dbWithCache, ready }}>
                  {children}
            </DBContext.Provider>
      );
}

export const useDBContext = () => {
      const context =  useContext(DBContext);
      if (context) {
            return context;
      }
      throw new Error("useDBContext must be used within a DBContextProvider");
}