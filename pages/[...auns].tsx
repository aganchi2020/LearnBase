import { GetServerSideProps } from "next"
import { Inter } from "next/font/google"
import knex from "../src/knex"
import {
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material"
import { useRouter } from "next/router"

interface Proficiency {
  Subjects: string
  AUN: string
  Years: string
  PercentProficient: string
}

interface School {
  AUN: string
  SchoolName: string
}

interface Spending {
  TotalExpenditures: string
  AUN: string
  Years: string
}

interface SchoolData {
  pssa: Proficiency[]
  keystone: Proficiency[]
  spending: Spending[]
  schoolName: string
}

interface PSSAProficiency {
  year: string
  elaPro: string
  mathPro: string
  sciencePro: string
}

interface KSProficiency {
  year: string
  bioPro: string
  algPro: string
  litPro: string
}

function ksGroupByYear(p: Proficiency[]): KSProficiency[] {
  let yearmap = {} as Record<string, KSProficiency>
  for (const pro of p) {
    if (!(pro.Years in yearmap)) yearmap[pro.Years] = { year: pro.Years } as any
    if (pro.Subjects === "Biology") {
      yearmap[pro.Years].bioPro = pro.PercentProficient
    } else if (pro.Subjects === "Literature") {
      yearmap[pro.Years].litPro = pro.PercentProficient
    } else if (pro.Subjects === "Algebra I") {
      yearmap[pro.Years].algPro = pro.PercentProficient
    }
  }
  return Object.values(yearmap)
}

function pssaGroupByYear(p: Proficiency[]): PSSAProficiency[] {
  let yearmap = {} as Record<string, PSSAProficiency>
  for (const pro of p) {
    if (!(pro.Years in yearmap)) yearmap[pro.Years] = { year: pro.Years } as any
    if (pro.Subjects === "English Language Arts") {
      yearmap[pro.Years].elaPro = pro.PercentProficient
    } else if (pro.Subjects === "Math") {
      yearmap[pro.Years].mathPro = pro.PercentProficient
    } else if (pro.Subjects === "Science") {
      yearmap[pro.Years].sciencePro = pro.PercentProficient
    }
  }
  return Object.values(yearmap)
}
interface Props {
  schoolData: SchoolData[]
  schools: School[]
}
export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
}) => {
  const schools = (await knex
    .from("School")
    .select(["AUN", "SchoolName"])) as School[]

  const schoolData = await Promise.all(
    (query?.auns as string[]).map(async (aun) => {
      const s = (await knex
        .from("School")
        .select(["SchoolName", "AUN"])
        .where({ AUN: aun })
        .first()) as any
      const pssa = await knex
        .from("PSSA")
        .select(["Subjects", "AUN", "Years", "PercentProficient"])
        .where({ AUN: aun })
      const spending = await knex
        .from("Spending")
        .select(["TotalExpenditures", "AUN", "Years"])
        .where({ AUN: aun })
      const keystone = await knex
        .from("Keystone")
        .select(["Subjects", "AUN", "Years", "PercentProficient"])
        .where({ AUN: aun })
      return {
        pssa,
        spending,
        keystone,
        schoolName: s?.SchoolName,
      } as unknown as SchoolData
    })
  )
  return {
    props: { schoolData, schools },
  }
}

const SchoolGraphs: React.FC<SchoolData> = (props) => {
  return (
    <Box>
      <KsGraph keystone={props.keystone} />
      <Box mt={2} />
      <PssaGraph pssa={props.pssa} />
      <Box mt={2} />
      <SpendingGraph spending={props.spending} />
    </Box>
  )
}

const KsGraph: React.FC<{ keystone: Proficiency[] }> = ({ keystone }) => {
  const ksdata = ksGroupByYear(keystone)
  return (
    <div>
      <h2>Keystone Data (% Average Proficiency)</h2>
    <LineChart
      width={730}
      height={400}
      data={ksdata}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis name="Year" dataKey="year" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        name="Biology Proficiency"
        dataKey="bioPro"
        stroke="#8884d8"
      />
      <Line
        type="monotone"
        name="Algebra Proficiency"
        dataKey="algPro"
        stroke="#82ca9d"
      />
      <Line
        type="monotone"
        name="Literature Proficiency"
        dataKey="litPro"
        stroke="#744738"
      />
    </LineChart>
    </div>
  )
}

const PssaGraph: React.FC<{ pssa: Proficiency[] }> = ({ pssa }) => {
  const pssaData = pssaGroupByYear(pssa)
  return (
    <div>
      <h2>Pssa Data (% Average Proficiency)</h2>
    <LineChart
      width={730}
      height={400}
      data={pssaData}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis name="Year" dataKey="year" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        name="English Language Arts Proficiency"
        dataKey="elaPro"
        stroke="#8884d8"
      />
      <Line
        type="monotone"
        name="Math Proficiency"
        dataKey="mathPro"
        stroke="#82ca9d"
      />
      <Line
        type="monotone"
        name="Science Proficiency"
        dataKey="sciencePro"
        stroke="#744738"
      />
    </LineChart>
    </div>
  )
}

const SpendingGraph: React.FC<{ spending: Spending[] }> = ({ spending }) => {
  const s = spending.map((s) => ({
    ...s,
    TotalExpenditures: parseInt(s.TotalExpenditures.replaceAll("$", "")),
  }))
  return (
    <div> 
      <h2>Total Spending (Millions of $)</h2>
    <LineChart
      width={730}
      height={400}
      data={s}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis name="Year" dataKey="Years" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        name="Total Expenditure"
        dataKey="TotalExpenditures"
        stroke="#8884d8"
      />
    </LineChart>
    </div>
  )
}

export default function Home({ schoolData, schools }: Props) {
  const router = useRouter()
  const [school1, school2] = router.query.auns as string[]
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Learnbase
          </Typography>
        </Toolbar>
      </AppBar>
      <Box mt={2} px={4}>
        <Box mb={4}>
          <Box display="flex" flexDirection={"row"}>
            <Autocomplete
              disablePortal
              options={schools}
              getOptionLabel={(o: School) => o.SchoolName}
              sx={{ width: 300 }}
              value={schools.find(({ AUN }) => AUN === school1)}
              onChange={(event: any, newValue: School | null) => {
                if (newValue?.AUN) {
                  router.push({ query: { auns: [newValue.AUN, school2] } })
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="District 1" />
              )}
            />
            <Box ml={2} />
            <Autocomplete
              disablePortal
              options={schools}
              getOptionLabel={(o: School) => o.SchoolName}
              sx={{ width: 300 }}
              value={schools.find(({ AUN }) => AUN === school2)}
              onChange={(event: any, newValue: School | null) => {
                if (newValue?.AUN) {
                  router.push({ query: { auns: [school1, newValue.AUN] } })
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="District 2" />
              )}
            />
          </Box>
        </Box>
        <Box display={"flex"} flexDirection={"row"}>
          {schoolData.map((s, i) => {
            return (
              <Box ml={i !== 0 ? 4 : undefined}>
                <Typography variant="h5" mb={2}>
                  {s.schoolName}
                </Typography>
                <SchoolGraphs {...s} />
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
