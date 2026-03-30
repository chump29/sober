import { type ChangeEvent, type Dispatch, type JSX, type MouseEvent, type SetStateAction } from "react"

import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import FormControlLabel from "@mui/material/FormControlLabel"
import InputAdornment from "@mui/material/InputAdornment"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"

import { info } from "../shared"

const DEBUG: boolean = false

const Settings = ({
  handleShowSettings,
  showCoin,
  setShowCoin,
  showCost,
  setShowCost,
  cost,
  setCost
}: {
  handleShowSettings: Dispatch<SetStateAction<boolean>>
  showCoin: boolean
  setShowCoin: Dispatch<SetStateAction<boolean>>
  showCost: boolean
  setShowCost: Dispatch<SetStateAction<boolean>>
  cost: number
  setCost: Dispatch<SetStateAction<number>>
}): JSX.Element => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault()
    const val: boolean = e.target.checked
    if (e.target.id === "coin") {
      setShowCoin(val)
      localStorage.setItem("soberDate-showCoin", val.toString())
      if (DEBUG) {
        info(`Show Coin: ${val}`)
      }
    } else {
      setShowCost(val)
      localStorage.setItem("soberDate-showCost", val.toString())
      if (DEBUG) {
        info(`Show Cost: ${val}`)
      }
    }
  }

  const handleCost = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault()
    const c: number = Number(e.target.value)
    if (isNaN(c) || c < 0) {
      return
    }
    setCost(c)
    localStorage.setItem("soberDate-cost", c.toString())
    if (DEBUG) {
      info(`Cost: $${c}`)
    }
  }

  const handleClose = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    handleShowSettings(false)
  }

  return (
    <Box
      sx={{
        alignItems: "center",
        bgcolor: "#292929",
        borderRadius: "6px",
        display: "flex",
        justifyContent: "center",
        marginTop: "20px",
        marginX: "auto",
        width: "300px"
      }}>
      <div className="p-5 rounded-xl w-50">
        <div className="text-2xl font-bold mb-5 text-center text-shadow-[3px_3px_6px_#000000]">Settings</div>
        <div>
          <FormControlLabel
            control={
              <Switch checked={showCoin} data-testid="showCoin" id="coin" onChange={handleChange} size="small" />
            }
            label="Show AA Coin"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "0.8rem"
              }
            }}
            title="Show AA Coin"
          />
        </div>
        <div>
          <FormControlLabel
            control={<Switch checked={showCost} data-testid="showCost" onChange={handleChange} size="small" />}
            label="Show Weekly Cost"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "0.8rem"
              }
            }}
            title="Show Weekly Cost"
          />
        </div>
        {showCost ? (
          <div>
            <TextField
              data-testid="cost"
              label="Weekly Amount"
              onChange={handleCost}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  )
                }
              }}
              sx={{
                marginTop: "10px"
              }}
              title="Weekly Amount"
              type="search"
              value={cost}
              variant="filled"
            />
          </div>
        ) : null}
        <div className="text-center">
          <Button
            onClick={handleClose}
            sx={{
              fontWeight: "bold",
              marginTop: "20px"
            }}
            title="Close"
            variant="contained">
            Close
          </Button>
        </div>
      </div>
    </Box>
  )
}

export default Settings
