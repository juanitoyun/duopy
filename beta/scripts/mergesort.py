# mergesort: list -> list
# Retorna una nueva lista ordenada.
def mergesort(a):
    if len(a) <= 1:
        return a.copy()
    m = len(a) // 2
    b, c = mergesort(a[:m]), mergesort(a[m:])
    i = j = 0
    r = []
    while i < len(b) and j < len(c):
        if b[i] <= c[j]:
            r.append(b[i])
            i += 1
        else:
            r.append(c[j])
            j += 1
    return r + b[i:] + c[j:]


assert mergesort([]) == []
assert mergesort([2, 1, 2]) == [1, 2, 2]
print(mergesort([8, 3, 5, 1]))
