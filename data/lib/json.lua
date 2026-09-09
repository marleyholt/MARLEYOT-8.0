local json = {}
local function escape_str(s)
local in_char  = {'\\', '"', '/', '\b', '\f', '\n', '\r', '\t'}
local out_char = {'\\\\', '\\"', '\\/', '\\b', '\\f', '\\n', '\\r', '\\t'}
for i, c in ipairs(in_char) do s = s:gsub(c, out_char[i]) end
return s
end
function json.encode(val)
local vtype = type(val)
if vtype == "nil" then return "null"
elseif vtype == "boolean" then return val and "true" or "false"
elseif vtype == "number" then return tostring(val)
elseif vtype == "string" then return '"' .. escape_str(val) .. '"'
elseif vtype == "table" then
local is_array, count, max_index = true, 0, 0
for k, _ in pairs(val) do
if type(k) == "number" and math.floor(k) == k and k > 0 then
if k > max_index then max_index = k end
count = count + 1
else is_array = false; break end
end
if is_array and count > 0 and max_index == count then
local parts = {}
for i = 1, count do table.insert(parts, json.encode(val[i])) end
return "[" .. table.concat(parts, ",") .. "]"
else
local parts = {}
for k, v in pairs(val) do table.insert(parts, '"' .. escape_str(tostring(k)) .. '":' .. json.encode(v)) end
return "{" .. table.concat(parts, ",") .. "}"
end
end
return '"' .. escape_str(tostring(val)) .. '"'
end
local function skip_whitespace(str, idx) return str:find("%S", idx) or (#str + 1) end
local parse_value
local function parse_string(str, idx)
local j, res = idx + 1, {}
while j <= #str do
local c = str:sub(j, j)
if c == '"' then return table.concat(res), j + 1
elseif c == '\\' then
j = j + 1
local esc = str:sub(j, j)
if esc == '"' or esc == '\\' or esc == '/' then table.insert(res, esc)
elseif esc == 'b' then table.insert(res, '\b')
elseif esc == 'f' then table.insert(res, '\f')
elseif esc == 'n' then table.insert(res, '\n')
elseif esc == 'r' then table.insert(res, '\r')
elseif esc == 't' then table.insert(res, '\t')
else table.insert(res, esc) end
else table.insert(res, c) end
j = j + 1
end
return table.concat(res), j
end
local function parse_number(str, idx)
local num_str = str:match("^-?%d+%.?%d*[eE]?[+-]?%d*", idx)
if num_str then return tonumber(num_str), idx + #num_str end
return 0, idx + 1
end
local function parse_array(str, idx)
local res = {}
idx = idx + 1
while idx <= #str do
idx = skip_whitespace(str, idx)
if str:sub(idx, idx) == ']' then return res, idx + 1 end
local val, next_idx = parse_value(str, idx)
table.insert(res, val)
idx = skip_whitespace(str, next_idx)
local c = str:sub(idx, idx)
if c == ',' then idx = idx + 1
elseif c == ']' then return res, idx + 1 end
end
return res, idx
end
local function parse_object(str, idx)
local res = {}
idx = idx + 1
while idx <= #str do
idx = skip_whitespace(str, idx)
if str:sub(idx, idx) == '}' then return res, idx + 1 end
if str:sub(idx, idx) ~= '"' then return res, idx + 1 end
local key, next_idx = parse_string(str, idx)
idx = skip_whitespace(str, next_idx)
if str:sub(idx, idx) == ':' then idx = idx + 1 end
idx = skip_whitespace(str, idx)
local val, after_val = parse_value(str, idx)
res[key] = val
idx = skip_whitespace(str, after_val)
local c = str:sub(idx, idx)
if c == ',' then idx = idx + 1
elseif c == '}' then return res, idx + 1 end
end
return res, idx
end
function parse_value(str, idx)
idx = skip_whitespace(str, idx)
local c = str:sub(idx, idx)
if c == '"' then return parse_string(str, idx)
elseif c == '{' then return parse_object(str, idx)
elseif c == '[' then return parse_array(str, idx)
elseif c == 't' and str:sub(idx, idx + 3) == "true" then return true, idx + 4
elseif c == 'f' and str:sub(idx, idx + 4) == "false" then return false, idx + 5
elseif c == 'n' and str:sub(idx, idx + 3) == "null" then return nil, idx + 4
else return parse_number(str, idx) end
end
function json.decode(str)
if type(str) ~= "string" or #str == 0 then return nil end
local ok, val = pcall(function() return parse_value(str, 1) end)
return ok and val or nil
end
return json
